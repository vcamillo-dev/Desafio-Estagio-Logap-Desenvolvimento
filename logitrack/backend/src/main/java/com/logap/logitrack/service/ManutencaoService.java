package com.logap.logitrack.service;

import java.util.List;
import java.util.stream.Collectors;
import java.math.BigDecimal;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.logap.logitrack.domain.entity.Manutencao;
import com.logap.logitrack.domain.entity.Veiculo;
import com.logap.logitrack.dto.ManutencaoDTO;
import com.logap.logitrack.repository.ManutencaoRepository;
import com.logap.logitrack.repository.VeiculoRepository;

@Service
public class ManutencaoService {

    private final ManutencaoRepository manutencaoRepository;
    private final VeiculoRepository veiculoRepository;

    public ManutencaoService(ManutencaoRepository manutencaoRepository, VeiculoRepository veiculoRepository) {
        this.manutencaoRepository = manutencaoRepository;
        this.veiculoRepository = veiculoRepository;
    }

    public List<ManutencaoDTO> buscarTodas() {
        return manutencaoRepository.findAll()
                .stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    public ManutencaoDTO buscarPorId(Integer id) {
        Manutencao m = manutencaoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Manutenção não encontrada"));
        return converterParaDTO(m);
    }

    public ManutencaoDTO salvar(ManutencaoDTO dto) {
        validarDados(dto);
        Manutencao m = new Manutencao();
        preencherDados(m, dto);

        Manutencao salva = manutencaoRepository.save(m);
        return converterParaDTO(salva);
    }

    public ManutencaoDTO atualizar(Integer id, ManutencaoDTO dto) {
        Manutencao m = manutencaoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Manutenção não encontrada"));
        validarDados(dto);
        preencherDados(m, dto);

        Manutencao atualizada = manutencaoRepository.save(m);
        return converterParaDTO(atualizada);
    }

    public void deletar(Integer id) {
        if (!manutencaoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Manutenção não encontrada");
        }
        manutencaoRepository.deleteById(id);
    }

    private void preencherDados(Manutencao m, ManutencaoDTO dto) {
        Veiculo veiculo = veiculoRepository.findById(dto.getVeiculoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Veículo não encontrado"));
        m.setVeiculo(veiculo);
        m.setDataInicio(dto.getDataInicio());
        m.setDataFinalizacao(dto.getDataFinalizacao());
        m.setTipoServico(dto.getTipoServico());
        m.setCustoEstimado(dto.getCustoEstimado());
        if (dto.getStatus() != null) {
            m.setStatus(dto.getStatus());
        }
    }

    private void validarDados(ManutencaoDTO dto) {
        if (dto == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O corpo da requisição é obrigatório");
        }
        if (dto.getVeiculoId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "veiculoId é obrigatório");
        }
        if (dto.getDataInicio() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "dataInicio é obrigatória");
        }
        if (dto.getDataFinalizacao() != null && dto.getDataFinalizacao().isBefore(dto.getDataInicio())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "dataFinalizacao não pode ser anterior à dataInicio");
        }
        if (dto.getCustoEstimado() != null && dto.getCustoEstimado().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "custoEstimado não pode ser negativo");
        }
    }

    private ManutencaoDTO converterParaDTO(Manutencao m) {
        ManutencaoDTO dto = new ManutencaoDTO();
        dto.setId(m.getId());
        dto.setVeiculoId(m.getVeiculo().getId());
        dto.setPlacaVeiculo(m.getVeiculo().getPlaca());
        dto.setDataInicio(m.getDataInicio());
        dto.setDataFinalizacao(m.getDataFinalizacao());
        dto.setTipoServico(m.getTipoServico());
        dto.setCustoEstimado(m.getCustoEstimado());
        dto.setStatus(m.getStatus());
        return dto;
    }
}
