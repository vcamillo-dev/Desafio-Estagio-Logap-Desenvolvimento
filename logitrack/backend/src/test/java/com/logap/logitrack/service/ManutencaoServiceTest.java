package com.logap.logitrack.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.logap.logitrack.domain.entity.Manutencao;
import com.logap.logitrack.domain.entity.TipoVeiculo;
import com.logap.logitrack.domain.entity.Veiculo;
import com.logap.logitrack.dto.ManutencaoDTO;
import com.logap.logitrack.repository.ManutencaoRepository;
import com.logap.logitrack.repository.VeiculoRepository;

@ExtendWith(MockitoExtension.class)
class ManutencaoServiceTest {

    @Mock
    private ManutencaoRepository manutencaoRepository;

    @Mock
    private VeiculoRepository veiculoRepository;

    private ManutencaoService service;

    @BeforeEach
    void configurar() {
        service = new ManutencaoService(manutencaoRepository, veiculoRepository);
    }

    @Test
    void salvaManutencaoComDadosValidos() {
        Veiculo veiculo = criarVeiculo();
        when(veiculoRepository.findById(1)).thenReturn(Optional.of(veiculo));
        when(manutencaoRepository.save(any(Manutencao.class))).thenAnswer(invocacao -> {
            Manutencao manutencao = invocacao.getArgument(0);
            manutencao.setId(10);
            return manutencao;
        });

        ManutencaoDTO resultado = service.salvar(dtoValido());

        assertEquals(10, resultado.getId());
        assertEquals(1, resultado.getVeiculoId());
        verify(manutencaoRepository).save(any(Manutencao.class));
    }

    @Test
    void rejeitaCadastroSemVeiculo() {
        ManutencaoDTO dto = dtoValido();
        dto.setVeiculoId(null);

        assertStatus(HttpStatus.BAD_REQUEST, () -> service.salvar(dto));
        verifyNoInteractions(veiculoRepository, manutencaoRepository);
    }

    @Test
    void rejeitaCadastroSemDataDeInicio() {
        ManutencaoDTO dto = dtoValido();
        dto.setDataInicio(null);

        assertStatus(HttpStatus.BAD_REQUEST, () -> service.salvar(dto));
        verifyNoInteractions(veiculoRepository, manutencaoRepository);
    }

    @Test
    void rejeitaFinalizacaoAnteriorAoInicio() {
        ManutencaoDTO dto = dtoValido();
        dto.setDataFinalizacao(LocalDate.of(2026, 10, 14));

        assertStatus(HttpStatus.BAD_REQUEST, () -> service.salvar(dto));
        verifyNoInteractions(veiculoRepository, manutencaoRepository);
    }

    @Test
    void rejeitaCustoNegativo() {
        ManutencaoDTO dto = dtoValido();
        dto.setCustoEstimado(new BigDecimal("-1.00"));

        assertStatus(HttpStatus.BAD_REQUEST, () -> service.salvar(dto));
        verifyNoInteractions(veiculoRepository, manutencaoRepository);
    }

    @Test
    void retornaNaoEncontradoQuandoVeiculoNaoExiste() {
        when(veiculoRepository.findById(1)).thenReturn(Optional.empty());

        assertStatus(HttpStatus.NOT_FOUND, () -> service.salvar(dtoValido()));
    }

    private ManutencaoDTO dtoValido() {
        ManutencaoDTO dto = new ManutencaoDTO();
        dto.setVeiculoId(1);
        dto.setDataInicio(LocalDate.of(2026, 10, 15));
        dto.setDataFinalizacao(LocalDate.of(2026, 10, 16));
        dto.setTipoServico("Troca de óleo");
        dto.setCustoEstimado(new BigDecimal("350.00"));
        return dto;
    }

    private Veiculo criarVeiculo() {
        return new Veiculo(1, "ABC-1234", "Fiorino", TipoVeiculo.LEVE, 2022);
    }

    private void assertStatus(HttpStatus esperado, Executavel executavel) {
        ResponseStatusException erro = assertThrows(ResponseStatusException.class, executavel::executar);
        assertEquals(esperado, erro.getStatusCode());
    }

    @FunctionalInterface
    private interface Executavel {
        void executar();
    }
}
