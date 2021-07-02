package com.example.demospringboot;
import com.example.demospringboot.controller.HelloWorldController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class DemoSpringBootApplicationTests {

    @Autowired
    private HelloWorldController controller;

    @Test
    void contextLoads() {
      ResponseEntity<String> resp = controller.helloWorld();
      HttpStatus status = resp.getStatusCode();
      assertThat(status.is2xxSuccessful()).isTrue();
    }
}
