package com.intermediation.gateway;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import reactor.core.publisher.Mono;

import java.io.IOException;

@Controller
public class StaticContentController {

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    @ResponseBody
    public Mono<String> index() {
        return Mono.fromCallable(() -> {
            try {
                Resource resource = new ClassPathResource("static/index.html");
                return new String(resource.getInputStream().readAllBytes());
            } catch (IOException e) {
                return "<html><body><h1>Error loading page</h1><p>" + e.getMessage() + "</p></body></html>";
            }
        });
    }

    @GetMapping(value = "/index.html", produces = MediaType.TEXT_HTML_VALUE)
    @ResponseBody
    public Mono<String> indexHtml() {
        return index();
    }
}
