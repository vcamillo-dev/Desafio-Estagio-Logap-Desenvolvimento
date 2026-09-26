package com.logap.logitrack.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.logap.logitrack.dto.ManutencaoDTO;
import com.logap.logitrack.service.ManutencaoService;

@RestController
@RequestMapping("/api/manutencoes")
public class ManutencaoController {

    private final ManutencaoService service;

    public ManutencaoController(ManutencaoService service) {
        this.service = service;
    }

    @GetMapping
    public List<ManutencaoDTO> listarTodas() {
        return service.buscarTodas();
    }

    @GetMapping("/{id}")
    public ManutencaoDTO buscarPorId(@PathVariable Integer id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    public ManutencaoDTO salvar(@RequestBody ManutencaoDTO dto) {
        return service.salvar(dto);
    }

    @PutMapping("/{id}")
    public ManutencaoDTO atualizar(@PathVariable Integer id, @RequestBody ManutencaoDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Integer id) {
        service.deletar(id);
    }
}
