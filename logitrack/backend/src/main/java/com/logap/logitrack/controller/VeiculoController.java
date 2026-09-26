package com.logap.logitrack.controller;

import java.util.List;
import java.util.Locale;
import java.time.Year;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.logap.logitrack.domain.entity.Veiculo;
import com.logap.logitrack.domain.entity.Viagem;
import com.logap.logitrack.repository.VeiculoRepository;
import com.logap.logitrack.repository.ViagemRepository;

@RestController
@RequestMapping("/api/veiculos")
public class VeiculoController {

    private final VeiculoRepository veiculoRepository;
    private final ViagemRepository viagemRepository;

    public VeiculoController(VeiculoRepository veiculoRepository, ViagemRepository viagemRepository) {
        this.veiculoRepository = veiculoRepository;
        this.viagemRepository = viagemRepository;
    }

    @GetMapping
    public List<Veiculo> listarTodos() {
        return veiculoRepository.findAll();
    }

    @GetMapping("/{id}/detalhes")
    public Map<String, Object> obterDetalhes(@PathVariable Integer id) {
        Veiculo veiculo = veiculoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Veículo não encontrado."));
        List<Viagem> viagens = viagemRepository.findByVeiculo_IdOrderByDataSaidaDesc(id);

        Map<String, Object> detalhes = new LinkedHashMap<>();
        detalhes.put("veiculo", veiculo);
        detalhes.put("totalViagens", viagens.size());
        detalhes.put("distanciaTotalKm", viagemRepository.somarDistanciaDoVeiculo(id));
        detalhes.put("viagens", viagens);
        return detalhes;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Veiculo criar(@RequestBody Veiculo veiculo) {
        if (veiculo == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe os dados do veículo.");
        }

        String placa = veiculo.getPlaca() == null
                ? ""
                : veiculo.getPlaca().trim().toUpperCase(Locale.ROOT);
        String modelo = veiculo.getModelo() == null ? "" : veiculo.getModelo().trim();

        if (placa.isBlank() || placa.length() > 10) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe uma placa com até 10 caracteres.");
        }
        if (modelo.isBlank() || modelo.length() > 50) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe um modelo com até 50 caracteres.");
        }
        if (veiculo.getTipo() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecione o tipo do veículo.");
        }
        if (veiculo.getAno() != null && (veiculo.getAno() < 1900 || veiculo.getAno() > Year.now().getValue() + 1)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe um ano válido.");
        }
        if (veiculoRepository.findByPlaca(placa).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um veículo cadastrado com essa placa.");
        }

        veiculo.setId(null);
        veiculo.setPlaca(placa);
        veiculo.setModelo(modelo);
        return veiculoRepository.save(veiculo);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Integer id) {
        if (!veiculoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Veículo não encontrado.");
        }
        veiculoRepository.deleteById(id);
    }
}
