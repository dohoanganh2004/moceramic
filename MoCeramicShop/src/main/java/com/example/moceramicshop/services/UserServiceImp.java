package com.example.moceramicshop.services;

import com.example.moceramicshop.dtos.request.user.ChangePasswordRequestDTO;
import com.example.moceramicshop.dtos.request.user.CreateUserRequestDTO;
import com.example.moceramicshop.dtos.request.user.UpdateProfileRequestDTO;
import com.example.moceramicshop.dtos.request.user.UpdateUserRequestDTO;
import com.example.moceramicshop.dtos.response.user.UserResponseDTO;
import com.example.moceramicshop.exceptions.BadRequestException;
import com.example.moceramicshop.exceptions.ConflictException;
import com.example.moceramicshop.exceptions.ResourceNotFoundException;
import com.example.moceramicshop.mappers.UserMapper;
import com.example.moceramicshop.models.Role;
import com.example.moceramicshop.models.User;
import com.example.moceramicshop.repositories.RoleRepository;
import com.example.moceramicshop.repositories.UserRepository;
import com.example.moceramicshop.specifications.UserSpecification;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;

@Slf4j
@Service
public class UserServiceImp implements UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;
    private final UserMapper userMapper;
    private final FileStorageService fileStorageService;

    public UserServiceImp(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder,
                           AuthService authService, UserMapper userMapper, FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authService = authService;
        this.userMapper = userMapper;
    }

    @Override
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toUserResponseDTO)
                .toList();
    }

    @Override
    public Page<UserResponseDTO> search(String search, Integer roleId, Boolean isActive, Pageable pageable) {
        Specification<User> spec = Specification
                .where(UserSpecification.hasNameEmailOrPhoneContaining(search))
                .and(UserSpecification.hasRoleId(roleId))
                .and(UserSpecification.hasIsActive(isActive));
        log.info("Searching users: search={} roleId={} isActive={} page={}", search, roleId, isActive, pageable);
        return userRepository.findAll(spec, pageable).map(userMapper::toUserResponseDTO);
    }

    @Override
    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findWithRoleById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với id " + id));
        return userMapper.toUserResponseDTO(user);
    }

    @Override
    public UserResponseDTO create(CreateUserRequestDTO request) {
        if (userRepository.getUserByEmail(request.getEmail()) != null) {
            throw new ConflictException("Email đã tồn tại, vui lòng sử dụng email khác");
        }
        String phone = request.getPhone();
        if (phone != null && userRepository.getUserByPhone(phone) != null) {
            throw new ConflictException("Số điện thoại đã tồn tại, vui lòng sử dụng số điện thoại khác");
        }
        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy role với id " + request.getRoleId()));

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(phone);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setOauthProvider(request.getOauthProvider());
        user.setAvatarUrl(request.getAvatarUrl());
        user.setRole(role);
        user.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());

        User savedUser = userRepository.saveAndFlush(user);
        log.info("Created user id={} email={} roleId={}", savedUser.getId(), savedUser.getEmail(), request.getRoleId());
        return userMapper.toUserResponseDTO(userRepository.findWithRoleById(savedUser.getId()).orElseThrow());
    }

    @Override
    public UserResponseDTO updateUser(Long id, UpdateUserRequestDTO request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với id " + id));

        User userWithEmail = userRepository.getUserByEmail(request.getEmail());
        if (userWithEmail != null && !userWithEmail.getId().equals(id)) {
            throw new ConflictException("Email đã tồn tại, vui lòng sử dụng email khác");
        }
        String phone = request.getPhone();
        if (phone != null) {
            User userWithPhone = userRepository.getUserByPhone(phone);
            if (userWithPhone != null && !userWithPhone.getId().equals(id)) {
                throw new ConflictException("Số điện thoại đã tồn tại, vui lòng sử dụng số điện thoại khác");
            }
        }
        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy role với id " + request.getRoleId()));

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(phone);
        user.setRole(role);
        user.setIsActive(request.getIsActive());
        user.setUpdatedAt(Instant.now());

        User savedUser = userRepository.saveAndFlush(user);
        log.info("Updated user id={}", id);
        return userMapper.toUserResponseDTO(userRepository.findWithRoleById(savedUser.getId()).orElseThrow());
    }

    @Override
    public void deleteUserById(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy user với id " + id);
        }
        userRepository.deleteById(id);
        log.info("Deleted user id={}", id);
    }

    @Override
    public UserResponseDTO updateProfile(Long currentUserId, UpdateProfileRequestDTO request) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với id " + currentUserId));

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setAvatarUrl(request.getAvatarUrl());
        user.setUpdatedAt(Instant.now());

        User savedUser = userRepository.saveAndFlush(user);
        log.info("Updated profile for userId={}", currentUserId);
        return userMapper.toUserResponseDTO(userRepository.findWithRoleById(savedUser.getId()).orElseThrow());
    }

    @Override
    public UserResponseDTO updateAvatar(Long currentUserId, MultipartFile file) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với id " + currentUserId));

        String oldAvatarUrl = user.getAvatarUrl();
        String newAvatarUrl = fileStorageService.store(file);
        user.setAvatarUrl(newAvatarUrl);
        user.setUpdatedAt(Instant.now());

        User savedUser = userRepository.saveAndFlush(user);
        if (oldAvatarUrl != null && !oldAvatarUrl.equals(newAvatarUrl)) {
            fileStorageService.delete(oldAvatarUrl);
        }
        log.info("Updated avatar for userId={}", currentUserId);
        return userMapper.toUserResponseDTO(userRepository.findWithRoleById(savedUser.getId()).orElseThrow());
    }

    @Override
    public void changePassword(Long currentUserId, ChangePasswordRequestDTO request, String currentAccessToken) {
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với id " + currentUserId));

        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            log.warn("Failed change-password attempt for userId={}: current password mismatch", currentUserId);
            throw new BadRequestException("Mật khẩu hiện tại không đúng");
        }
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new BadRequestException("Mật khẩu mới xác nhận không khớp");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(Instant.now());
        userRepository.saveAndFlush(user);

        authService.blacklistAccessToken(currentAccessToken);
        log.info("Password changed for userId={}, previous access token blacklisted", currentUserId);
    }

    @Override
    public UserResponseDTO banUser(Long id) {
        User user = userRepository.findWithRoleById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với id " + id));

        user.setIsActive(false);
        user.setUpdatedAt(Instant.now());
        userRepository.saveAndFlush(user);
        log.info("Banned userId={}", id);
        return userMapper.toUserResponseDTO(user);
    }

    @Override
    public UserResponseDTO unbanUser(Long id) {
        User user = userRepository.findWithRoleById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với id " + id));

        user.setIsActive(true);
        user.setUpdatedAt(Instant.now());
        userRepository.saveAndFlush(user);
        log.info("Unbanned userId={}", id);
        return userMapper.toUserResponseDTO(user);
    }
}
