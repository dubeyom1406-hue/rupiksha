package com.rupiksha.backend.controller;

import com.rupiksha.backend.dto.VerificationDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.json.JSONObject;
import org.json.XML;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api")
public class ApiController {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${EMAIL_USER}")
    private String emailFrom;

    @Value("${FAST2SMS_KEY:}")
    private String fast2SmsKey;

    @Value("${CASHFREE_CLIENT_ID:}")
    private String cashfreeClientId;

    @Value("${CASHFREE_CLIENT_SECRET:}")
    private String cashfreeClientSecret;

    @Value("${RAZORPAY_KEY_ID:}")
    private String razorpayKeyId;

    @Value("${RAZORPAY_KEY_SECRET:}")
    private String razorpayKeySecret;

    @Value("${venus.api.recharge.url}")
    private String venusRechargeUrl;

    @Value("${venus.api.balance.url}")
    private String venusBalanceUrl;

    @Value("${venus.api.status.url}")
    private String venusStatusUrl;

    @Value("${venus.auth.key}")
    private String venusAuthKey;

    @Value("${venus.auth.pass}")
    private String venusAuthPass;

    @Value("${bbps.base-url:https://venusrecharge.co.in}")
    private String bbpsBaseUrl;

    @Value("${bbps.servicetype:EB}")
    private String bbpsServiceType;


    // In-memory OTP storage
    private static final Map<String, OtpData> otpStore = new ConcurrentHashMap<>();

    private static class OtpData {
        String otp;
        long expires;
        OtpData(String otp, long expires) { this.otp = otp; this.expires = expires; }
    }

    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of("status", "UP", "message", "Backend is connected!"));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendEmailOtp(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("to", body.get("email"));
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        }
        String otp = body.get("otp");
        if (otp == null || otp.isBlank()) {
            otp = String.valueOf(100000 + new Random().nextInt(900000));
        }
        System.out.println("Sending OTP to: " + email + " | OTP: " + otp);
        otpStore.put(email, new OtpData(otp, System.currentTimeMillis() + 300000));

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(emailFrom);
            helper.setTo(email);
            helper.setSubject("Email Verification OTP - RuPiKsha");
            
            String html = """
                <div style="font-family: Arial; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #2c3e50;">Email Verification</h2>
                    <p>Your OTP for RuPiKsha verification is:</p>
                    <h1 style="color: #3498db; letter-spacing: 5px;">%s</h1>
                    <p>This OTP will expire in 5 minutes.</p>
                </div>
                """.formatted(otp);
            
            helper.setText(html, true);
            mailSender.send(message);
            return ResponseEntity.ok(Map.of("success", true, "message", "OTP sent to email"));
        } catch (Exception e) {
            System.err.println("❌ Error sending OTP Email: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/send-mobile-otp")
    public ResponseEntity<?> sendMobileOtp(@RequestBody Map<String, String> body) {
        String mobile = body.get("mobile");
        String otp = String.valueOf(100000 + new Random().nextInt(900000));
        otpStore.put(mobile, new OtpData(otp, System.currentTimeMillis() + 300000));

        if (fast2SmsKey == null || fast2SmsKey.isEmpty()) {
            return ResponseEntity.ok(Map.of("message", "OTP sent (Simulation)", "preview", otp));
        }

        try {
            String url = String.format("https://www.fast2sms.com/dev/bulkV2?authorization=%s&route=otp&variables_values=%s&numbers=%s",
                    fast2SmsKey, otp, mobile);
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                return ResponseEntity.ok(Map.of("success", true, "message", "OTP sent successfully to " + mobile));
            } else {
                return ResponseEntity.status(response.getStatusCode()).body(Map.of("error", "Fast2SMS Error: " + response.getBody()));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to send SMS: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String identity = body.getOrDefault("identity", body.get("email"));
        String otp = body.get("otp");
        OtpData stored = otpStore.get(identity);
        if (stored == null) return ResponseEntity.badRequest().body(Map.of("error", "No OTP found"));
        if (System.currentTimeMillis() > stored.expires) {
            otpStore.remove(identity);
            return ResponseEntity.badRequest().body(Map.of("error", "OTP expired"));
        }
        if (stored.otp.equals(otp)) {
            otpStore.remove(identity);
            return ResponseEntity.ok(Map.of("success", true, "message", "Verified"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid OTP"));
        }
    }

    @PostMapping("/verify-account")
    public Map<String, Object> verifyAccount() {
        return Map.of("success", true, "accountHolderName", "MR. OM DUBEY");
    }

    @PostMapping("/verify-pan")
    public ResponseEntity<?> verifyPan(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of("status", "VALID", "name", "OM DUBEY")));
    }

    @PostMapping("/verify-upi")
    public ResponseEntity<?> verifyUpi(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of("status", "VALID", "name", "OM DUBEY")));
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> data) {
        try {
            double amount = Double.parseDouble(data.get("amount").toString());
            com.razorpay.RazorpayClient client = new com.razorpay.RazorpayClient(razorpayKeyId, razorpayKeySecret);
            org.json.JSONObject orderRequest = new org.json.JSONObject();
            orderRequest.put("amount", (int) (amount * 100));
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "rcpt_" + System.currentTimeMillis());
            com.razorpay.Order order = client.orders.create(orderRequest);
            return ResponseEntity.ok(Map.of("success", true, "order_id", order.get("id"), "amount", order.get("amount"), "key", razorpayKeyId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "error", e.getMessage()));
        }
    }


    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> data) {
        try {
            org.json.JSONObject attributes = new org.json.JSONObject();
            attributes.put("razorpay_order_id", data.get("razorpay_order_id"));
            attributes.put("razorpay_payment_id", data.get("razorpay_payment_id"));
            attributes.put("razorpay_signature", data.get("razorpay_signature"));
            if (com.razorpay.Utils.verifyPaymentSignature(attributes, razorpayKeySecret)) {
                return ResponseEntity.ok(Map.of("success", true, "message", "Payment verified successfully"));
            } else {
                return ResponseEntity.status(400).body(Map.of("success", false, "message", "Invalid signature"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    // --- STUBBED ENDPOINTS (REMOVED REAL API INTEGRATION) ---

    @PostMapping("/recharge")
    public ResponseEntity<?> performRecharge(@RequestBody Map<String, Object> data) {
            try {
                Object mobileObj = data.get("mobileNo");
                String mobile = mobileObj != null ? mobileObj.toString() : "";
                if (mobile.isBlank()) {
                    Object m = data.get("mobile");
                    mobile = m != null ? m.toString() : "";
                }

                Object opCodeObj = data.get("operatorCode");
                String operatorInput = opCodeObj != null ? opCodeObj.toString() : "";
                if (operatorInput.isBlank()) {
                    Object op = data.get("operator");
                    operatorInput = op != null ? op.toString() : "";
                }
                String operatorCode = getVenusOperatorCode(operatorInput);

                Object serviceTypeObj = data.get("serviceType");
                String serviceType = (serviceTypeObj != null && !serviceTypeObj.toString().isBlank()) ? serviceTypeObj.toString() : "MR";

            Object amountObj = data.get("amount");
            String amountStr = amountObj != null ? amountObj.toString() : "";

            if (mobile.isBlank() || operatorCode.isBlank() || amountStr.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Missing required fields: mobile/mobileNo, operator/operatorCode, amount"
                ));
            }

            double amount = Double.parseDouble(amountStr);
            String merchantRefNo = String.valueOf(System.currentTimeMillis());

            HttpHeaders headers = new HttpHeaders();
            headers.set("authkey", venusAuthKey);
            headers.set("authpass", venusAuthPass);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();
            body.put("mobileNo", mobile);
            body.put("operatorCode", operatorCode);
            body.put("serviceType", serviceType);
            body.put("amount", amount);
            body.put("merchantRefNo", merchantRefNo);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<JsonNode> response = restTemplate.postForEntity(venusRechargeUrl, request, JsonNode.class);
            JsonNode res = response.getBody();

            boolean success = res != null && "SUCCESS".equalsIgnoreCase(res.path("responseStatus").asText());

            Map<String, Object> result = new HashMap<>();
            result.put("success", success);
            result.put("message", res != null ? res.path("description").asText() : "No response from Venus");
            result.put("merchantRefNo", merchantRefNo);
            result.put("operatorTxnId", res != null ? res.path("operatorTxnId").asText(null) : null);
            result.put("orderNo", res != null ? res.path("orderNo").asText(null) : null);
            result.put("raw", res);

            System.out.println("Venus API Request Body: " + body);
            System.out.println("Venus API Response: " + res);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace(); // Added for console debugging
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Recharge failed",
                    "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/recharge-balance")
    public ResponseEntity<?> getRechargeBalance() {
        try {
            // DOCUMENTATION: https://venusrecharge.co.in/Balance.aspx?authkey=XXX&authpass=xxxx&service=recharge
            String url = bbpsBaseUrl + "/Balance.aspx" +
                         "?authkey=" + venusAuthKey +
                         "&authpass=" + venusAuthPass +
                         "&service=recharge";

            System.out.println("[VENUS BALANCE CHECK] Requesting: " + url);
            String xmlResponse = restTemplate.getForObject(url, String.class);
            
            JSONObject xmlJson = XML.toJSONObject(xmlResponse);
            JSONObject responseRoot = xmlJson.optJSONObject("Response");

            Map<String, Object> result = new HashMap<>();
            result.put("success", responseRoot != null);
            result.put("balance", responseRoot != null ? responseRoot.optDouble("Balance", 0.0) : 0.0);
            result.put("raw", xmlJson);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Unable to fetch balance from Venus",
                    "error", e.getMessage()
            ));
        }
    }

    @PostMapping("/recharge-status")
    public ResponseEntity<?> checkRechargeStatus(@RequestBody Map<String, String> data) {
        String merchantRefNo = data.getOrDefault("merchantRefNo", "");
        if (merchantRefNo.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "merchantRefNo is required"
            ));
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("authkey", venusAuthKey);
            headers.set("authpass", venusAuthPass);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> request = new HttpEntity<>("{}", headers);

            String url = venusStatusUrl + merchantRefNo;
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    JsonNode.class
            );

            JsonNode res = response.getBody();
            boolean success = res != null && "SUCCESS".equalsIgnoreCase(res.path("responseStatus").asText());

            Map<String, Object> result = new HashMap<>();
            result.put("success", success);
            result.put("message", res != null ? res.path("description").asText() : "No response from Venus");
            result.put("merchantRefNo", res != null ? res.path("merchantRefNo").asText(merchantRefNo) : merchantRefNo);
            result.put("mobileNo", res != null ? res.path("mobileNo").asText(null) : null);
            result.put("amount", res != null ? res.path("amount").asText(null) : null);
            result.put("operatorTxnId", res != null ? res.path("operatorTxnId").asText(null) : null);
            result.put("orderNo", res != null ? res.path("orderNo").asText(null) : null);
            result.put("raw", res);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Unable to fetch status from Venus",
                    "error", e.getMessage()
            ));
        }
    }

    @RequestMapping(value = "/bill-fetch", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<?> billFetch(@RequestParam Map<String, String> allParams, @RequestBody(required = false) Map<String, String> bodyParams) {
        Map<String, String> data = new HashMap<>();
        if (allParams != null) data.putAll(allParams);
        if (bodyParams != null) data.putAll(bodyParams);

        String consumerNo = data.getOrDefault("consumerNo", "");
        String opcode = data.getOrDefault("opcode", "");
        String subDiv = data.getOrDefault("subDiv", "");
        String mobile = data.getOrDefault("mobile", "");
        
        String normalizedOp = (opcode == null ? "" : opcode).trim().toUpperCase();
        if (opcode == null || normalizedOp.isEmpty() || "UNDEFINED".equals(normalizedOp) || "NONE".equals(normalizedOp) || "NULL".equals(normalizedOp)) {
            System.err.println("[JAVA BBPS] Blocked Invalid Opcode: " + opcode);
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid Opcode (NONE). Please select the biller again."));
        }

        if (mobile.length() < 10) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Valid 10-digit Consumer Mobile Number is required."));
        }

        // DOCUMENT REQUIREMENT: System generated ID, length should be 14 character
        String merchantRef = (System.currentTimeMillis() + "000000").substring(0, 14);

        try {
            StringBuilder url = new StringBuilder(bbpsBaseUrl + "/FetchBill.aspx");
            url.append("?authkey=").append(venusAuthKey);
            url.append("&authpass=").append(venusAuthPass);
            url.append("&opcode=").append(opcode);
            url.append("&Merchantrefno=").append(merchantRef);
            url.append("&ConsumerID=").append(URLEncoder.encode(consumerNo, StandardCharsets.UTF_8));
            url.append("&ConsumerMobileNo=").append(mobile);
            url.append("&ServiceType=").append(bbpsServiceType);
            
            if (subDiv != null && !subDiv.isEmpty() && !"undefined".equals(subDiv)) {
                url.append("&SubDiv=").append(URLEncoder.encode(subDiv, StandardCharsets.UTF_8));
            } else {
                url.append("&SubDiv=");
            }
            url.append("&Field1=&Field2=");

            System.out.println("[VENUS JAVA BBPS FETCH] Requesting: " + url.toString());
            String xmlResponse = restTemplate.getForObject(url.toString(), String.class);
            
            // Parse XML to structured JSON for the frontend
            try {
                JSONObject xmlJson = XML.toJSONObject(xmlResponse);
                JSONObject responseRoot = xmlJson.optJSONObject("Response");
                if (responseRoot == null) responseRoot = xmlJson.optJSONObject("BillFetch");
                if (responseRoot == null) responseRoot = xmlJson;

                String status = responseRoot.optString("ResponseStatus", "").toUpperCase();
                String desc = responseRoot.optString("Description", "");

                if ("TXN".equals(status) || "SAC".equals(status) || "RCS".equals(status) || desc.toUpperCase().contains("SUCCESS")) {
                    Map<String, Object> bill = new HashMap<>();
                    bill.put("custName", responseRoot.optString("ConsumerName", "Valued Customer"));
                    bill.put("amount", responseRoot.optDouble("DueAmount", 0.0));
                    bill.put("dueDate", responseRoot.optString("DueDate", "N/A"));
                    bill.put("billNo", responseRoot.optString("OrderId", merchantRef));
                    bill.put("orderId", responseRoot.optString("OrderId", ""));
                    bill.put("merchantRef", merchantRef);

                    return ResponseEntity.ok(Map.of("success", true, "bill", bill, "source", "VENUS_JAVA"));
                }
                
                return ResponseEntity.ok(Map.of("success", false, "message", desc.isEmpty() ? "Venus Error: " + status : desc));
            } catch (Exception parseEx) {
                System.err.println("XML Parse failed: " + parseEx.getMessage());
                return ResponseEntity.ok(Map.of("success", true, "raw", xmlResponse, "source", "VENUS_JAVA_RAW"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", "Venus API Error: " + e.getMessage()));
        }
    }

    @PostMapping("/bill-pay")
    public ResponseEntity<?> billPay(@RequestBody Map<String, String> data) {
        String biller = data.getOrDefault("biller", "");
        String consumerNo = data.getOrDefault("consumerNo", "");
        String amount = data.getOrDefault("amount", "");
        String opcode = data.getOrDefault("opcode", "");
        String subDiv = data.getOrDefault("subDiv", "");
        String mobile = data.getOrDefault("mobile", "");
        String orderId = data.getOrDefault("orderId", "ORD" + System.currentTimeMillis());
        
        String normalizedOp = (opcode == null ? "" : opcode).trim().toUpperCase();
        if (opcode == null || normalizedOp.isEmpty() || "UNDEFINED".equals(normalizedOp) || "NONE".equals(normalizedOp) || "NULL".equals(normalizedOp)) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid Payment Biller selection (NONE)."));
        }

        if (mobile.length() < 10) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Valid 10-digit Consumer Mobile Number is required."));
        }

        // DOCUMENT REQUIREMENT: System generated ID, length should be 14 character
        String merchantRef = (System.currentTimeMillis() + "000000").substring(0, 14);

        try {
            StringBuilder url = new StringBuilder(bbpsBaseUrl + "/PaymentBill.aspx");
            url.append("?authkey=").append(venusAuthKey);
            url.append("&authpass=").append(venusAuthPass);
            url.append("&opcode=").append(opcode);
            url.append("&Merchantrefno=").append(merchantRef);
            url.append("&ConsumerID=").append(URLEncoder.encode(consumerNo, StandardCharsets.UTF_8));
            url.append("&ConsumerMobileNo=").append(mobile);
            url.append("&ServiceType=").append(bbpsServiceType);
            url.append("&Amount=").append(amount);
            url.append("&Orderid=").append(orderId);
            
            if (subDiv != null && !subDiv.isEmpty()) {
                url.append("&SubDiv=").append(URLEncoder.encode(subDiv, StandardCharsets.UTF_8));
            } else {
                url.append("&SubDiv=");
            }
            url.append("&Field1=&Field2=");

            System.out.println("[VENUS JAVA BBPS PAY] Requesting: " + url.toString());
            String xmlResponse = restTemplate.getForObject(url.toString(), String.class);
            
            try {
                JSONObject xmlJson = XML.toJSONObject(xmlResponse);
                JSONObject responseRoot = xmlJson.optJSONObject("Response");
                if (responseRoot == null) responseRoot = xmlJson.optJSONObject("PaymentBill");
                if (responseRoot == null) responseRoot = xmlJson;

                String status = responseRoot.optString("ResponseStatus", "").toUpperCase();
                String desc = responseRoot.optString("Description", "");

                if ("TXN".equals(status) || "SAC".equals(status) || "RCS".equals(status) || desc.toUpperCase().contains("SUCCESS")) {
                    return ResponseEntity.ok(Map.of(
                        "success", true, 
                        "message", desc.isEmpty() ? "Payment Successful!" : desc,
                        "txid", responseRoot.optString("OperatorTxnId", responseRoot.optString("OrderId", merchantRef)),
                        "source", "VENUS_JAVA"
                    ));
                }
                return ResponseEntity.ok(Map.of("success", false, "message", desc.isEmpty() ? "Payment Error: " + status : desc));
            } catch (Exception parseEx) {
                return ResponseEntity.ok(Map.of("success", true, "raw", xmlResponse, "source", "VENUS_JAVA_RAW"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ---------------------------------------------------------

    @PostMapping("/send-approval")
    public ResponseEntity<?> sendApprovalEmail(@RequestBody Map<String, String> data) {
        System.out.println("Processing Approval Email for: " + data.get("to"));
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(emailFrom);
            helper.setTo(data.get("to"));
            helper.setSubject("Account Approved - " + data.get("portal_type") + " Portal");
            
            String frontendUrl = System.getProperty("FRONTEND_URL", "http://localhost:5173");
            String html = """
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #0f172a; padding: 30px; text-align: center;">
                        <h1 style="color: #10b981; margin: 0; font-size: 24px;">Welcome to RUPIKSHA</h1>
                        <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Your Account is Approved!</p>
                    </div>
                    <div style="padding: 40px; background-color: #ffffff;">
                        <p style="font-size: 16px; color: #334155;">Hello <strong>%s</strong>,</p>
                        <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Congratulations! Your request for the <strong>%s Portal</strong> has been approved. You can now log in using the credentials below:</p>
                        
                        <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 25px; margin: 30px 0;">
                            <table style="width: 100%%; font-size: 14px; color: #334155;">
                                <tr>
                                    <td style="padding: 5px 0; color: #64748b; width: 40%%;">Login Mobile:</td>
                                    <td style="padding: 5px 0; font-weight: bold;">%s</td>
                                </tr>
                                <tr>
                                    <td style="padding: 5px 0; color: #64748b;">Password:</td>
                                    <td style="padding: 5px 0; font-weight: bold; color: #ef4444;">%s</td>
                                </tr>
                                <tr>
                                    <td style="padding: 5px 0; color: #64748b;">%s:</td>
                                    <td style="padding: 5px 0; font-weight: bold; color: #0284c7;">%s</td>
                                </tr>
                            </table>
                        </div>
 
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="%s" style="background-color: #0f172a; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Login to Portal</a>
                        </div>
                    </div>
                    <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
                        <p>© 2025 RUPIKSHA FINTECH PVT LTD. All rights reserved.</p>
                        <p>This is an automated message, please do not reply.</p>
                    </div>
                </div>
            """.formatted(
                data.get("name"),
                data.get("portal_type"),
                data.get("login_id"),
                data.get("password"),
                data.get("id_label"),
                data.get("id_value"),
                frontendUrl
            );
            
            helper.setText(html, true);
            mailSender.send(message);
            return ResponseEntity.ok(Map.of("success", true, "message", "Approval email sent"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @PostMapping("/send-credentials")
    public ResponseEntity<?> sendCredentialsEmail(@RequestBody Map<String, String> data) {
        System.out.println("Processing Credentials Email for: " + data.get("to") + " | Portal: " + data.get("portal_type"));
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(emailFrom);
            helper.setTo(data.get("to"));
            helper.setSubject("Your Login Credentials - " + data.get("portal_type"));

            String frontendUrl = System.getProperty("FRONTEND_URL", "http://localhost:5173");
            String html = """
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <div style="background-color: #0f172a; padding: 30px; text-align: center;">
                        <h1 style="color: #38bdf8; margin: 0; font-size: 24px;">RUPIKSHA CREDENTIALS</h1>
                        <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Welcome Aboard!</p>
                    </div>
                    <div style="padding: 40px; background-color: #ffffff;">
                        <p style="font-size: 16px; color: #334155;">Hello <strong>%s</strong>,</p>
                        <p style="font-size: 14px; color: #64748b; line-height: 1.6;">You have been added to the <strong>%s</strong> portal by <strong>%s</strong>. Here are your login details:</p>
                        
                        <div style="background-color: #f0f9ff; border: 1px dashed #7dd3fc; border-radius: 12px; padding: 25px; margin: 30px 0;">
                            <table style="width: 100%%; font-size: 14px; color: #334155;">
                                <tr>
                                    <td style="padding: 5px 0; color: #64748b; width: 40%%;">Login ID:</td>
                                    <td style="padding: 5px 0; font-weight: bold;">%s</td>
                                </tr>
                                <tr>
                                    <td style="padding: 5px 0; color: #64748b;">Password:</td>
                                    <td style="padding: 5px 0; font-weight: bold; color: #0ea5e9;">%s</td>
                                </tr>
                                <tr>
                                    <td style="padding: 5px 0; color: #64748b;">Portal:</td>
                                    <td style="padding: 5px 0; font-weight: bold; color: #0284c7;">%s</td>
                                </tr>
                            </table>
                        </div>
 
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="%s" style="background-color: #0f172a; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Login to Your Account</a>
                        </div>
                    </div>
                    <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
                        <p>© 2025 RUPIKSHA FINTECH PVT LTD. All rights reserved.</p>
                        <p>For support, please contact your administrator.</p>
                    </div>
                </div>
            """.formatted(
                data.get("name"),
                data.get("portal_type"),
                data.get("added_by"),
                data.get("login_id"),
                data.get("password"),
                data.get("portal_type"),
                frontendUrl
            );

            helper.setText(html, true);
            mailSender.send(message);
            return ResponseEntity.ok(Map.of("success", true, "message", "Credential email sent"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("success", false, "error", e.getMessage()));
        }
    }






    // ── Admin OTP (reuses the existing otpStore + OtpData above) ──────────────
    private static final String ADMIN_OTP_EMAIL = "dubeyom1406@gmail.com";

    @PostMapping("/send-admin-otp")
    public ResponseEntity<?> sendAdminOtp(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim().toLowerCase();
        if (!email.equals(ADMIN_OTP_EMAIL)) {
            return ResponseEntity.status(403).body(Map.of("error", "Email not registered for OTP login."));
        }
        // Generate 6-digit OTP (expires in 2 minutes)
        String otp = String.valueOf(100000 + new Random().nextInt(900000));
        otpStore.put(email, new OtpData(otp, System.currentTimeMillis() + 2 * 60 * 1000L));

        // Send email
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(ADMIN_OTP_EMAIL);
            helper.setSubject("RuPiKsha Admin Login OTP");
            helper.setText(
                "<div style='font-family:Montserrat,sans-serif;background:#020617;padding:32px;border-radius:16px;max-width:480px;margin:auto'>" +
                "<img src='https://rupiksha.com/logo.png' style='height:48px;margin-bottom:24px;filter:invert(1)' />" +
                "<h2 style='color:#fff;font-size:20px;margin:0 0 8px'>Admin Login OTP</h2>" +
                "<p style='color:rgba(255,255,255,0.5);font-size:13px;margin:0 0 24px'>Use the OTP below to log in to the RuPiKsha Admin Portal. It expires in 2 minutes.</p>" +
                "<div style='background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:20px;text-align:center;margin-bottom:24px'>" +
                "<span style='font-size:36px;font-weight:900;letter-spacing:12px;color:#fff'>" + otp + "</span>" +
                "</div>" +
                "<p style='color:rgba(255,255,255,0.3);font-size:11px;text-align:center'>Do not share this OTP with anyone. Valid for 2 minutes only.</p>" +
                "<hr style='border-color:rgba(255,255,255,0.08);margin:20px 0'>" +
                "<p style='color:rgba(255,255,255,0.2);font-size:10px;text-align:center;text-transform:uppercase;letter-spacing:4px'>RuPiKsha Digital Services</p>" +
                "</div>",
                true
            );
            mailSender.send(msg);
            return ResponseEntity.ok(Map.of("success", true, "message", "OTP sent to " + ADMIN_OTP_EMAIL));
        } catch (Exception e) {
            e.printStackTrace();
            otpStore.remove(email);
            return ResponseEntity.status(500).body(Map.of("error", "Failed to send OTP: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-admin-otp")
    public ResponseEntity<?> verifyAdminOtp(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim().toLowerCase();
        String otp   = body.getOrDefault("otp", "").trim();
        OtpData stored = otpStore.get(email);
        if (stored == null) {
            return ResponseEntity.status(400).body(Map.of("error", "No OTP found. Please request a new one."));
        }
        if (System.currentTimeMillis() > stored.expires) {
            otpStore.remove(email);
            return ResponseEntity.status(400).body(Map.of("error", "OTP expired. Please request a new one."));
        }
        if (!otp.equals(stored.otp)) {
            return ResponseEntity.status(400).body(Map.of("error", "Incorrect OTP. Please try again."));
        }
        otpStore.remove(email); // single-use
        return ResponseEntity.ok(Map.of("success", true, "message", "OTP verified successfully."));
    }

    @PostMapping("/pan/apply")
    public ResponseEntity<?> panApply(@RequestBody Map<String, Object> data) {
        String fullName = (String) data.getOrDefault("fullName", "Applicant");
        return ResponseEntity.ok(Map.of("success", true, "applicationNumber", "PAN" + System.currentTimeMillis(), "message", "PAN application submitted successfully", "name", fullName));
    }

    private String getVenusOperatorCode(String name) {
        if (name == null || name.isBlank()) return "";
        String n = name.trim().toUpperCase();
        if (n.contains("AIRTEL")) return "ATL";
        if (n.contains("JIO")) return "JIO";
        if (n.contains("BSNL")) return "BSN";
        if (n.contains("VI") || n.contains("VODAFONE") || n.contains("IDEA")) return "VOD";
        return n;
    }
}

