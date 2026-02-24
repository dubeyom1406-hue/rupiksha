package com.rupiksha.backend.dto;

import lombok.Data;

@Data
public class VerificationDto {
    private String identity;
    private String email;
    private String otp;
    private String mobile;
}
