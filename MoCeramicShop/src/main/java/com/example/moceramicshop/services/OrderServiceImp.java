package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.order.OrderCreateRequestDTO;
import com.example.moceramicshop.dtos.response.order.OrderResponseDTO;
import com.example.moceramicshop.mappers.OrderMapper;
import com.example.moceramicshop.models.Order;
import com.example.moceramicshop.repositories.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.StreamSupport;

@Service
public class OrderServiceImp implements OrderService {
    private final OrderRepository repository;
    private final OrderMapper mapper;
    public OrderServiceImp(OrderRepository repository,OrderMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }
    @Override
    public List<OrderResponseDTO> getAll() {
        List<Order> orders = StreamSupport.stream(repository.findAll().spliterator(), false).toList();
        return orders.stream().map(mapper::toOrderResponseDTO).toList();
    }

    @Override
    public List<OrderResponseDTO> getAllByCustomerId(Long customerId) {
        List<Order> orders = repository.findByUser_Id(customerId);
        return orders.stream().map(mapper::toOrderResponseDTO).toList();
    }

    @Override
    public OrderResponseDTO getById(Long id) {
        return null;
    }

    @Override
    public OrderResponseDTO create(Long customerId, OrderCreateRequestDTO request) {
        return null;
    }
}
