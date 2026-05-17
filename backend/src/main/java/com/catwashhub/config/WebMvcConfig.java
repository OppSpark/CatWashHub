package com.catwashhub.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${upload.path}")
    private String m_UploadPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry _registry) {
        _registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + m_UploadPath + "/");
    }
}
