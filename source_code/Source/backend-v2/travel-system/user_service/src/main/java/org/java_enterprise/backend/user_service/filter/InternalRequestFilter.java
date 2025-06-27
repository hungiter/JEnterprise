package org.java_enterprise.backend.user_service.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class InternalRequestFilter implements Filter {

    @Value("${app.secret}")
    private String SECRET_KEY;

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        Filter.super.init(filterConfig);
    }

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) servletRequest;
        HttpServletResponse res = (HttpServletResponse) servletResponse;

//        String internalSecret = req.getHeader("X-Internal-Secret");
//        System.out.println("User API - Check secret key: "+internalSecret);
//
//        if (!SECRET_KEY.equals(internalSecret)) {
//            res.setStatus(HttpServletResponse.SC_FORBIDDEN);
//            res.getWriter().write("Forbidden: Invalid secret key.");
//            return;
//        }

        filterChain.doFilter(req, res);
    }

    @Override
    public void destroy() {
        Filter.super.destroy();
    }
}