package com.example.moceramicshop.controllers;

import com.example.moceramicshop.dtos.request.address.AddressRequestDTO;
import com.example.moceramicshop.dtos.response.address.AddressResponseDTO;
import com.example.moceramicshop.security.CustomUserDetails;
import com.example.moceramicshop.services.AddressService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/address")
public class AddressController {
    private final AddressService addressService;
    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }
@PostMapping("/create")
    public ResponseEntity<AddressResponseDTO> create (@AuthenticationPrincipal CustomUserDetails currentUser,
                                                      @Valid @RequestBody AddressRequestDTO request) {
        return ResponseEntity.ok(addressService.create(currentUser.getUser().getId(), request));
    }
@PutMapping("/update/{id}")
    public ResponseEntity<AddressResponseDTO> update(@AuthenticationPrincipal CustomUserDetails currentUser,
                                                     @Valid @RequestBody AddressRequestDTO request,
                                                     @PathVariable Long id  ) {
        return ResponseEntity.ok(addressService.update(currentUser.getUser().getId(), id, request));
    }
 @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id,@AuthenticationPrincipal CustomUserDetails currentUser) {
        addressService.delete(currentUser.getUser().getId(), id);
    }

    @PatchMapping("/{id}/default")
    public ResponseEntity<AddressResponseDTO> setDefault(@PathVariable Long id,
                                                          @AuthenticationPrincipal CustomUserDetails currentUser) {
        return ResponseEntity.ok(addressService.setDefault(currentUser.getUser().getId(), id));
    }
 }
