package com.logap.logitrack.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

import com.logap.logitrack.dto.ManutencaoDTO;
import com.logap.logitrack.service.ManutencaoService;

class ManutencaoControllerTest {

    private ManutencaoService service;
    private MockMvc mockMvc;

    @BeforeEach
    void configurar() {
        service = mock(ManutencaoService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new ManutencaoController(service)).build();
    }

    @Test
    void listaManutencoes() throws Exception {
        when(service.buscarTodas()).thenReturn(List.of(dtoComId(7)));

        mockMvc.perform(get("/api/manutencoes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(7));

        verify(service).buscarTodas();
    }

    @Test
    void consultaManutencaoPorId() throws Exception {
        when(service.buscarPorId(7)).thenReturn(dtoComId(7));

        mockMvc.perform(get("/api/manutencoes/7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7));

        verify(service).buscarPorId(7);
    }

    @Test
    void cadastraManutencao() throws Exception {
        when(service.salvar(any(ManutencaoDTO.class))).thenReturn(dtoComId(8));

        mockMvc.perform(post("/api/manutencoes")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(8));

        verify(service).salvar(any(ManutencaoDTO.class));
    }

    @Test
    void atualizaManutencao() throws Exception {
        when(service.atualizar(eq(7), any(ManutencaoDTO.class))).thenReturn(dtoComId(7));

        mockMvc.perform(put("/api/manutencoes/7")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7));

        verify(service).atualizar(eq(7), any(ManutencaoDTO.class));
    }

    @Test
    void excluiManutencao() throws Exception {
        mockMvc.perform(delete("/api/manutencoes/7"))
                .andExpect(status().isOk());

        verify(service).deletar(7);
    }

    @Test
    void devolve404ParaIdInexistente() throws Exception {
        when(service.buscarPorId(999))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Manutenção não encontrada"));

        mockMvc.perform(get("/api/manutencoes/999"))
                .andExpect(status().isNotFound());
    }

    private ManutencaoDTO dtoComId(Integer id) {
        ManutencaoDTO dto = new ManutencaoDTO();
        dto.setId(id);
        return dto;
    }
}
