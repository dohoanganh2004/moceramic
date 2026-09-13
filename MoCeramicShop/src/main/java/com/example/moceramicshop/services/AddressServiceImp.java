package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.address.AddressRequestDTO;
import com.example.moceramicshop.dtos.response.address.AddressResponseDTO;
import com.example.moceramicshop.exceptions.ForbiddenException;
import com.example.moceramicshop.exceptions.ResourceNotFoundException;
import com.example.moceramicshop.mappers.AddressMapper;
import com.example.moceramicshop.models.Address;
import com.example.moceramicshop.models.User;
import com.example.moceramicshop.repositories.AddressRepository;
import com.example.moceramicshop.repositories.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Service
public class AddressServiceImp implements AddressService {
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final AddressMapper addressMapper;

    public AddressServiceImp(UserRepository userRepository,AddressRepository addressRepository, AddressMapper addressMapper) {
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.addressMapper = addressMapper;

    }

    @Override
    public List<AddressResponseDTO> getAllByCurrentUser(Long currentUserID) {
        log.info("Fetching addresses for userId={}", currentUserID);
        return addressRepository.findByUser_Id(currentUserID).stream()
                .sorted(Comparator.comparing(Address::getIsDefault, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(addressMapper::toResponseDTO)
                .toList();
    }

    @Override
    public AddressResponseDTO create(Long currentUserID, AddressRequestDTO request) {
        User user = userRepository.getUserById(currentUserID);
        if(user == null) throw  new RuntimeException("User not found");
        Address address = new Address();
        address.setUser(user);
        address.setRecipientName(request.getRecipientName());
        address.setPhone(request.getPhone());
        address.setAddressLine(request.getAddressLine());
        address.setWard(request.getWard());
        address.setDistrict(request.getDistrict());
        address.setCity(request.getCity());
        address.setCountry(request.getCountry() != null ? request.getCountry() : "Việt Nam");
        address.setIsDefault(false);
        address.setCreatedAt(Instant.now());
        address.setUpdatedAt(Instant.now());
        addressRepository.save(address);
        log.info("Created address id={} for userId={}", address.getId(), currentUserID);
        return addressMapper.toResponseDTO(address);
    }

    @Override
    public AddressResponseDTO update(Long currentUserID, Long id, AddressRequestDTO request) {
        Address address = addressRepository.getAddressById(id);
        if (address == null) throw new ResourceNotFoundException("Không tìm thấy địa chỉ với id " + id);
        if (!address.getUser().getId().equals(currentUserID)) {
            log.warn("User {} attempted to update address {} owned by user {}", currentUserID, id, address.getUser().getId());
            throw new ForbiddenException("Bạn không có quyền sửa địa chỉ này");
        }

        address.setRecipientName(request.getRecipientName());
        address.setPhone(request.getPhone());
        address.setAddressLine(request.getAddressLine());
        address.setWard(request.getWard());
        address.setDistrict(request.getDistrict());
        address.setCity(request.getCity());
        if (request.getCountry() != null) {
            address.setCountry(request.getCountry());
        }
        address.setUpdatedAt(Instant.now());

        log.info("Updated address id={} for userId={}", id, currentUserID);
        return addressMapper.toResponseDTO(addressRepository.saveAndFlush(address));
    }

    @Override
    @Transactional
    public AddressResponseDTO setDefault(Long currentUserID, Long id) {
        Address target = addressRepository.getAddressById(id);
        if (target == null) throw new ResourceNotFoundException("Không tìm thấy địa chỉ với id " + id);
        if (!target.getUser().getId().equals(currentUserID)) {
            log.warn("User {} attempted to set default on address {} owned by user {}", currentUserID, id, target.getUser().getId());
            throw new ForbiddenException("Bạn không có quyền cập nhật địa chỉ này");
        }

        List<Address> userAddresses = addressRepository.findByUser_Id(currentUserID);
        for (Address address : userAddresses) {
            address.setIsDefault(address.getId().equals(id));
            address.setUpdatedAt(Instant.now());
        }
        addressRepository.saveAll(userAddresses);

        log.info("Set address id={} as default for userId={}", id, currentUserID);
        return addressMapper.toResponseDTO(addressRepository.getAddressById(id));
    }

    @Override
    public AddressResponseDTO delete(Long currentUserID, Long id) {
        Address address = addressRepository.getAddressById(id);
        if (address == null) throw new ResourceNotFoundException("Không tìm thấy địa chỉ với id " + id);
        if (!address.getUser().getId().equals(currentUserID)) {
            log.warn("User {} attempted to delete address {} owned by user {}", currentUserID, id, address.getUser().getId());
            throw new ForbiddenException("Bạn không có quyền xóa địa chỉ này");
        }
        addressRepository.delete(address);
        log.info("Deleted address id={} for userId={}", id, currentUserID);
        return null;
    }
}
