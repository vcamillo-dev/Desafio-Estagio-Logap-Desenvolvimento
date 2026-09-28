package com.logap.logitrack.config;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class SupabaseAuthInterceptor implements HandlerInterceptor {

    private final String supabaseUrl;
    private final String publishableKey;
    private final boolean authenticationEnabled;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public SupabaseAuthInterceptor(
            @Value("${supabase.url}") String supabaseUrl,
            @Value("${supabase.publishable-key}") String publishableKey,
            @Value("${app.auth.enabled:true}") boolean authenticationEnabled) {
        this.supabaseUrl = supabaseUrl;
        this.publishableKey = publishableKey;
        this.authenticationEnabled = authenticationEnabled;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws IOException {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        // O bypass só é habilitado explicitamente pelo Compose local. Por padrão, a API exige Supabase.
        if (!authenticationEnabled) {
            return true;
        }

        if (supabaseUrl.isBlank() || publishableKey.isBlank()) {
            writeError(response, HttpStatus.SERVICE_UNAVAILABLE, "A autenticação do Supabase não está configurada.");
            return false;
        }

        String authorization = request.getHeader("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ") || authorization.length() <= 7) {
            writeError(response, HttpStatus.UNAUTHORIZED, "Entre na sua conta para acessar este recurso.");
            return false;
        }

        try {
            URI userEndpoint = URI.create(supabaseUrl.replaceAll("/+$", "") + "/auth/v1/user");
            HttpRequest validationRequest = HttpRequest.newBuilder(userEndpoint)
                    .timeout(Duration.ofSeconds(8))
                    .header("apikey", publishableKey)
                    .header("Authorization", authorization)
                    .GET()
                    .build();
            HttpResponse<Void> validationResponse = httpClient.send(
                    validationRequest,
                    HttpResponse.BodyHandlers.discarding());

            if (validationResponse.statusCode() == HttpStatus.OK.value()) {
                return true;
            }
            if (validationResponse.statusCode() >= 500 || validationResponse.statusCode() == 429) {
                writeError(response, HttpStatus.SERVICE_UNAVAILABLE, "O Supabase está temporariamente indisponível.");
                return false;
            }
            writeError(response, HttpStatus.UNAUTHORIZED, "Sua sessão é inválida ou expirou. Entre novamente.");
            return false;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            writeError(response, HttpStatus.SERVICE_UNAVAILABLE, "Não foi possível verificar a sessão no Supabase.");
            return false;
        } catch (IllegalArgumentException exception) {
            writeError(response, HttpStatus.SERVICE_UNAVAILABLE, "A URL do projeto Supabase está inválida.");
            return false;
        } catch (IOException | RuntimeException exception) {
            writeError(response, HttpStatus.SERVICE_UNAVAILABLE, "Não foi possível verificar a sessão no Supabase.");
            return false;
        }
    }

    private void writeError(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.getWriter().write("{\"message\":\"" + message + "\"}");
    }
}
