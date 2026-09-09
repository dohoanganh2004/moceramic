package com.example.moceramicshop.mappers;

import com.example.moceramicshop.dtos.response.newsletter.NewsletterSubscriberResponseDTO;
import com.example.moceramicshop.models.NewsletterSubscriber;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NewsletterSubscriberMapper {
    NewsletterSubscriberResponseDTO toResponseDTO(NewsletterSubscriber newsletterSubscriber);
}
