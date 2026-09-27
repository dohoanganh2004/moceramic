package com.example.moceramicshop.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.BasicPolymorphicTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.redisson.Redisson;
import org.redisson.api.RedissonClient;
import org.redisson.config.Config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.Map;

// RedissonClient is configured explicitly here (rather than relying on
// redisson-spring-boot-starter's own autodetection) so it reads the same
// spring.data.redis.* properties as everything else in this app - one source
// of truth for the Redis connection. Used for the distributed lock around
// inventory reservation (see InventoryLockService); StringRedisTemplate,
// used for the token blacklist and rate limiting, is already autoconfigured
// by spring-boot-starter-data-redis from those same properties.
@Configuration
@EnableCaching
public class RedisConfig {

    @Value("${spring.data.redis.host}")
    private String redisHost;

    @Value("${spring.data.redis.port}")
    private int redisPort;

    @Value("${spring.data.redis.password:}")
    private String redisPassword;

    @Bean(destroyMethod = "shutdown")
    public RedissonClient redissonClient() {
        Config config = new Config();
        var serverConfig = config.useSingleServer()
                .setAddress("redis://" + redisHost + ":" + redisPort);
        if (redisPassword != null && !redisPassword.isBlank()) {
            serverConfig.setPassword(redisPassword);
        }
        return Redisson.create(config);
    }

    // DTOs cached here (CategoryResponseDTO, ProductResponseDTO, ...) aren't
    // java.io.Serializable, so the default JDK serializer would blow up on the
    // first cache write - values are stored as JSON instead. Per-cache TTL:
    // categories change rarely (10 min is fine); products embed live variant
    // stock counts, so it gets a short leash (2 min) to bound how stale
    // "in stock" can look (see the @Cacheable on ProductServiceImp.getProductById).
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // Default GenericJackson2JsonRedisSerializer() builds its own ObjectMapper
        // with no modules registered, which can't serialize java.time types
        // (Instant, etc.) present on nearly every cached DTO here. Also disable
        // WRITE_DATES_AS_TIMESTAMPS (Jackson's default): without it, a cache HIT
        // would serialize e.g. createdAt as a numeric epoch while a cache MISS
        // (Spring MVC's own Jackson config, which does disable it) serializes it
        // as an ISO-8601 string - same endpoint, two different response shapes
        // depending on cache state, which would break any client parsing dates.
        //
        // activateDefaultTyping is what the no-arg GenericJackson2JsonRedisSerializer()
        // sets up internally too - it's what lets deserialization know the value
        // was a ProductResponseDTO and not just a LinkedHashMap. Passing a custom
        // ObjectMapper into the constructor skips that setup, so it has to be
        // redone by hand here or every cache read throws a ClassCastException.
        // The As.PROPERTY argument is NOT optional here: the 2-arg overload of
        // activateDefaultTyping defaults to As.WRAPPER_ARRAY, which embeds type
        // info as `["com.example.Foo", {...}]` - fine for a single cached object,
        // but for a cached List<CategoryResponseDTO> it collides with the JSON
        // array the list itself already is, and every read fails with "expected
        // VALUE_STRING ... START_ARRAY". PROPERTY (`{"@class":"...", ...}`) has
        // no such collision.
        ObjectMapper redisObjectMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .activateDefaultTyping(
                        BasicPolymorphicTypeValidator.builder().allowIfBaseType(Object.class).build(),
                        ObjectMapper.DefaultTyping.EVERYTHING,
                        JsonTypeInfo.As.PROPERTY);
        RedisCacheConfiguration base = RedisCacheConfiguration.defaultCacheConfig()
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer(redisObjectMapper)))
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .disableCachingNullValues();

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(base.entryTtl(Duration.ofMinutes(10)))
                .withInitialCacheConfigurations(Map.of(
                        "categories", base.entryTtl(Duration.ofMinutes(10)),
                        "products", base.entryTtl(Duration.ofMinutes(2))
                ))
                .build();
    }
}
