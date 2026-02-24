package com.rupiksha.backend.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/")
public class RootController {

    @GetMapping
    public String root() {
        return """
        <html>
            <head>
                <title>RuPiKsha API - Java</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f0f2f5; }
                    .container { text-align: center; padding: 40px; background: white; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e1e4e8; }
                    h1 { color: #1e3a8a; margin-top: 0; }
                    p { color: #4b5563; font-size: 1.1rem; }
                    .status { display: inline-block; padding: 5px 15px; background: #dcfce7; color: #166534; border-radius: 20px; font-weight: bold; font-size: 0.9rem; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>RuPiKsha API Server (Java Spring Boot)</h1>
                    <p>The system is ready to handle payments and verification.</p>
                    <div class="status">● System Active</div>
                </div>
            </body>
        </html>
        """;
    }
}
