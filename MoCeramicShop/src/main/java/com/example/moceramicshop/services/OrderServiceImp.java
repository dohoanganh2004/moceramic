package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.order.OrderCancelRequestDTO;
import com.example.moceramicshop.dtos.request.order.OrderCreateRequestDTO;
import com.example.moceramicshop.dtos.request.order.OrderItemRequestDTO;
import com.example.moceramicshop.dtos.request.order.OrderItemUpdateRequestDTO;
import com.example.moceramicshop.dtos.request.order.OrderStatusUpdateRequestDTO;
import com.example.moceramicshop.dtos.response.order.OrderResponseDTO;
import com.example.moceramicshop.exceptions.BadRequestException;
import com.example.moceramicshop.exceptions.ForbiddenException;
import com.example.moceramicshop.exceptions.ResourceNotFoundException;
import com.example.moceramicshop.mappers.OrderMapper;
import com.example.moceramicshop.models.Address;
import com.example.moceramicshop.models.Inventory;
import com.example.moceramicshop.models.Order;
import com.example.moceramicshop.models.OrderItem;
import com.example.moceramicshop.models.OrderStatusHistory;
import com.example.moceramicshop.models.ProductVariant;
import com.example.moceramicshop.models.User;
import com.example.moceramicshop.models.Voucher;
import com.example.moceramicshop.repositories.*;
import com.example.moceramicshop.specifications.OrderSpecification;
import com.example.moceramicshop.utils.RandomCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.StreamSupport;

@Slf4j
@Service
public class OrderServiceImp implements OrderService {

    private static final String STATUS_PENDING = "pending";
    private static final String STATUS_CANCELLED = "cancelled";
    private static final String STATUS_DELIVERED = "delivered";

    private final OrderRepository repository;
    private final OrderItemRepository itemRepository;
    private final OrderMapper mapper;
    private final UserRepository userRepository;
    private final RandomCode randomCode;
    private final AddressRepository addressRepository;
    private final VoucherRepository voucherRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ObjectMapper objectMapper;
    private final InventoryRepository inventoryRepository;
    private final PaymentService paymentService;
    private final InventoryLockService inventoryLockService;

    public OrderServiceImp(OrderRepository repository,
                           OrderMapper mapper,
                           UserRepository userRepository,
                           RandomCode randomCode,
                           AddressRepository addressRepository,
                           VoucherRepository voucherRepository,
                           ProductVariantRepository productVariantRepository,
                           ObjectMapper objectMapper,
                           OrderItemRepository itemRepository,
                           InventoryRepository inventoryRepository,
                           PaymentService paymentService,
                           InventoryLockService inventoryLockService) {
        this.repository = repository;
        this.mapper = mapper;
        this.userRepository = userRepository;
        this.randomCode = randomCode;
        this.addressRepository = addressRepository;
        this.voucherRepository = voucherRepository;
        this.productVariantRepository = productVariantRepository;
        this.objectMapper = objectMapper;
        this.itemRepository = itemRepository;
        this.inventoryRepository = inventoryRepository;
        this.paymentService = paymentService;
        this.inventoryLockService = inventoryLockService;
    }

    @Override
    public List<OrderResponseDTO> getAll() {
        List<Order> orders = StreamSupport.stream(repository.findAll().spliterator(), false).toList();
        return orders.stream().map(mapper::toOrderResponseDTO).toList();
    }

    @Override
    public Page<OrderResponseDTO> search(String search, String status, Pageable pageable) {
        Specification<Order> spec = Specification
                .where(OrderSpecification.hasOrderCodeOrCustomerNameContaining(search))
                .and(OrderSpecification.hasStatus(status));
        log.info("Searching orders: search={} status={} page={}", search, status, pageable);
        return repository.findAll(spec, pageable).map(mapper::toOrderResponseDTO);
    }

    @Override
    public List<OrderResponseDTO> getAllByCustomerId(Long customerId) {
        User customer = userRepository.getUserById(customerId);
        if (customer == null) throw new ResourceNotFoundException("Không tìm thấy user với id " + customerId);
        List<Order> orders = repository.findByUser_Id(customerId);
        return orders.stream().map(mapper::toOrderResponseDTO).toList();
    }

    @Override
    public OrderResponseDTO getById(Long id) {
        Order order = repository.findById(id).orElse(null);
        if (order == null) throw new ResourceNotFoundException("Không tìm thấy đơn hàng với id " + id);
        return mapper.toOrderResponseDTO(order);
    }

    @Override
    @Transactional
    public OrderResponseDTO create(Long customerId, OrderCreateRequestDTO request) {
        User user = userRepository.getUserById(customerId);
        if (user == null) throw new ResourceNotFoundException("Không tìm thấy user với id " + customerId);

        Address address = addressRepository.getAddressById(request.getShippingAddressId());
        if (address == null) {
            throw new ResourceNotFoundException("Không tìm thấy địa chỉ với id " + request.getShippingAddressId());
        }
        if (!address.getUser().getId().equals(customerId)) {
            throw new ForbiddenException("Bạn không có quyền dùng địa chỉ này");
        }

        Order order = new Order();
        order.setOrderCode("ORD-" + randomCode.generateCode());
        order.setUser(user);
        order.setShippingAddress(address);
        order.setShippingSnapshot(buildShippingSnapshot(address));
        order.setStatus(STATUS_PENDING);
        order.setNote(request.getNote());
        order.setCreatedAt(Instant.now());
        order.setUpdatedAt(Instant.now());

        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderItemRequestDTO itemDto : request.getItems()) {
            ProductVariant variant = productVariantRepository.findById(itemDto.getVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy biến thể với id " + itemDto.getVariantId()));

            // Serialized per-variant (Redis lock) + an atomic conditional UPDATE
            // underneath (see InventoryRepository.reserveStock) - together these
            // make concurrent checkouts for the same low-stock variant safe: no
            // two requests can both pass the availability check and oversell.
            inventoryLockService.withLock(variant.getId(), () -> {
                int updated = inventoryRepository.reserveStock(variant.getId(), itemDto.getQuantity());
                if (updated == 0) {
                    Inventory inventory = inventoryRepository.findByVariant_Id(variant.getId()).orElse(null);
                    int available = inventory == null ? 0 : inventory.getQuantityOnHand() - inventory.getQuantityReserved();
                    log.warn("Insufficient stock for variantId={}: requested={} available={}", variant.getId(), itemDto.getQuantity(), available);
                    throw new BadRequestException("Sản phẩm '" + variant.getProduct().getName() + "' không đủ tồn kho (còn " + available + ")");
                }
                return null;
            });

            BigDecimal unitPrice = variant.getPrice();
            BigDecimal lineSubtotal = unitPrice.multiply(BigDecimal.valueOf(itemDto.getQuantity()));

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setVariant(variant);
            item.setProductNameSnapshot(variant.getProduct().getName());
            item.setVariantSnapshot(buildVariantSnapshot(variant));
            item.setUnitPrice(unitPrice);
            item.setQuantity(itemDto.getQuantity());
            item.setSubtotal(lineSubtotal);
            order.getItems().add(item);

            subtotal = subtotal.add(lineSubtotal);
        }

        Voucher voucher = null;
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.getVoucherCode() != null && !request.getVoucherCode().isBlank()) {
            voucher = voucherRepository.getVouchersByCode(request.getVoucherCode());
            if (voucher == null) {
                throw new ResourceNotFoundException("Không tìm thấy voucher với mã " + request.getVoucherCode());
            }
            discountAmount = validateAndCalculateDiscount(voucher, subtotal);
            order.setVoucher(voucher);
        }

        BigDecimal shippingFee = BigDecimal.ZERO;
        BigDecimal totalAmount = subtotal.subtract(discountAmount).add(shippingFee);
        if (totalAmount.compareTo(BigDecimal.ZERO) < 0) {
            totalAmount = BigDecimal.ZERO;
        }

        order.setSubtotal(subtotal);
        order.setDiscountAmount(discountAmount);
        order.setShippingFee(shippingFee);
        order.setTotalAmount(totalAmount);

        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setStatus(STATUS_PENDING);
        history.setNote("Đơn hàng mới được tạo");
        history.setChangedBy(user);
        history.setCreatedAt(Instant.now());
        order.getStatusHistory().add(history);

        Order saved = repository.save(order);

        if (voucher != null) {
            voucher.setUsedCount(voucher.getUsedCount() + 1);
            voucherRepository.save(voucher);
        }

        paymentService.createForOrder(saved, request.getPaymentMethod());

        log.info("Created order id={} code={} for customerId={} totalAmount={}", saved.getId(), saved.getOrderCode(), customerId, totalAmount);
        return mapper.toOrderResponseDTO(saved);
    }

    @Override
    @Transactional
    public OrderResponseDTO updateStatus(Long orderId, Long actorUserId, OrderStatusUpdateRequestDTO request) {
        Order order = repository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với id " + orderId));

        User actor = userRepository.getUserById(actorUserId);
        if (actor == null) {
            throw new ResourceNotFoundException("Không tìm thấy user với id " + actorUserId);
        }

        order.setStatus(request.getStatus());
        order.setUpdatedAt(Instant.now());

        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setStatus(request.getStatus());
        history.setNote(request.getNote());
        history.setChangedBy(actor);
        history.setCreatedAt(Instant.now());
        order.getStatusHistory().add(history);

        log.info("Order id={} status changed to {} by actorUserId={}", orderId, request.getStatus(), actorUserId);
        return mapper.toOrderResponseDTO(repository.save(order));
    }

    @Override
    public void delete(Long id) {
        Order order = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với id " + id));
        if (!order.getPayments().isEmpty()) {
            log.warn("Attempt to delete order id={} which already has payment(s)", id);
            throw new BadRequestException("Không thể xóa đơn hàng đã có giao dịch thanh toán");
        }
        repository.deleteById(id);
        log.info("Deleted order id={}", id);
    }

    @Override
    @Transactional
    public void deleteOrderItem(Long orderItemId, Long orderId) {
        Order order = repository.getOrderById(orderId);
        if(order == null) throw new RuntimeException("Order not found");
        OrderItem itemToRemove = order.getItems().stream()
                .filter(i -> i.getId().equals(orderItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm trong đơn với id " + orderItemId));
        order.getItems().remove(itemToRemove);
        order.setSubtotal(order.getSubtotal().subtract(itemToRemove.getSubtotal()));
        order.setTotalAmount(order.getSubtotal().subtract(order.getDiscountAmount()).add(order.getShippingFee()));
        order.setUpdatedAt(Instant.now());
        repository.save(order);
        log.info("Removed item id={} from order id={}", orderItemId, orderId);
    }

    @Override
    @Transactional
    public OrderResponseDTO updateOrderItem(Long orderId, Long orderItemId, OrderItemUpdateRequestDTO request) {
        Order order = repository.getOrderById(orderId);
        if (order == null) throw new ResourceNotFoundException("Không tìm thấy đơn hàng với id " + orderId);

        if (!STATUS_PENDING.equals(order.getStatus())) {
            throw new BadRequestException("Chỉ được sửa đơn hàng khi đang ở trạng thái pending");
        }

        OrderItem item = order.getItems().stream()
                .filter(i -> i.getId().equals(orderItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm trong đơn với id " + orderItemId));

        item.setQuantity(request.getQuantity());
        item.setSubtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(request.getQuantity())));

        BigDecimal subtotal = order.getItems().stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setSubtotal(subtotal);
        order.setTotalAmount(subtotal.subtract(order.getDiscountAmount()).add(order.getShippingFee()));
        order.setUpdatedAt(Instant.now());

        log.info("Updated item id={} in order id={} to quantity={}", orderItemId, orderId, request.getQuantity());
        return mapper.toOrderResponseDTO(repository.save(order));
    }

    @Override
    @Transactional
    public OrderResponseDTO cancel(Long orderId, Long actorUserId, OrderCancelRequestDTO request) {
        Order order = repository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đơn hàng với id " + orderId));

        if (STATUS_CANCELLED.equals(order.getStatus()) || STATUS_DELIVERED.equals(order.getStatus())) {
            log.warn("Attempt to cancel order id={} which is already {}", orderId, order.getStatus());
            throw new BadRequestException("Không thể hủy đơn hàng ở trạng thái " + order.getStatus());
        }

        User actor = userRepository.getUserById(actorUserId);
        if (actor == null) {
            throw new ResourceNotFoundException("Không tìm thấy user với id " + actorUserId);
        }

        for (OrderItem item : order.getItems()) {
            inventoryRepository.releaseStock(item.getVariant().getId(), item.getQuantity());
        }

        order.setStatus(STATUS_CANCELLED);
        order.setUpdatedAt(Instant.now());

        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setStatus(STATUS_CANCELLED);
        history.setNote(request.getReason());
        history.setChangedBy(actor);
        history.setCreatedAt(Instant.now());
        order.getStatusHistory().add(history);

        log.info("Order id={} cancelled by actorUserId={}, stock reservations released", orderId, actorUserId);
        return mapper.toOrderResponseDTO(repository.save(order));
    }

    private BigDecimal validateAndCalculateDiscount(Voucher voucher, BigDecimal subtotal) {
        if (!Boolean.TRUE.equals(voucher.getIsActive())) {
            log.warn("Voucher {} is not active", voucher.getCode());
            throw new BadRequestException("Voucher không còn hiệu lực");
        }
        Instant now = Instant.now();
        if (voucher.getStartDate() != null && now.isBefore(voucher.getStartDate())) {
            log.warn("Voucher {} not yet active, startDate={}", voucher.getCode(), voucher.getStartDate());
            throw new BadRequestException("Voucher chưa đến ngày sử dụng");
        }
        if (voucher.getEndDate() != null && now.isAfter(voucher.getEndDate())) {
            log.warn("Voucher {} expired at {}", voucher.getCode(), voucher.getEndDate());
            throw new BadRequestException("Voucher đã hết hạn");
        }
        if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            log.warn("Voucher {} usage limit reached: usedCount={} limit={}", voucher.getCode(), voucher.getUsedCount(), voucher.getUsageLimit());
            throw new BadRequestException("Voucher đã hết lượt sử dụng");
        }
        BigDecimal minOrderAmount = voucher.getMinOrderAmount() != null ? voucher.getMinOrderAmount() : BigDecimal.ZERO;
        if (subtotal.compareTo(minOrderAmount) < 0) {
            log.warn("Voucher {} requires minOrderAmount={} but subtotal={}", voucher.getCode(), minOrderAmount, subtotal);
            throw new BadRequestException("Đơn hàng chưa đạt giá trị tối thiểu " + minOrderAmount + " để áp dụng voucher");
        }

        BigDecimal discount;
        if ("percentage".equalsIgnoreCase(voucher.getDiscountType())) {
            discount = subtotal.multiply(voucher.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (voucher.getMaxDiscountAmount() != null && discount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                discount = voucher.getMaxDiscountAmount();
            }
        } else {
            discount = voucher.getDiscountValue();
        }

        return discount.compareTo(subtotal) > 0 ? subtotal : discount;
    }

    private String buildShippingSnapshot(Address address) {
        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put("recipientName", address.getRecipientName());
        snapshot.put("phone", address.getPhone());
        snapshot.put("addressLine", address.getAddressLine());
        snapshot.put("ward", address.getWard());
        snapshot.put("district", address.getDistrict());
        snapshot.put("city", address.getCity());
        snapshot.put("country", address.getCountry());
        return objectMapper.writeValueAsString(snapshot);
    }

    private String buildVariantSnapshot(ProductVariant variant) {
        StringBuilder sb = new StringBuilder();
        if (variant.getColorGlaze() != null) {
            sb.append(variant.getColorGlaze());
        }
        if (variant.getSize() != null) {
            if (sb.length() > 0) sb.append(" - ");
            sb.append(variant.getSize());
        }
        return sb.isEmpty() ? null : sb.toString();
    }
}
