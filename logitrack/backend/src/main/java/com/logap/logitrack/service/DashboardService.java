package com.logap.logitrack.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.logap.logitrack.dto.DashboardDTO;
import com.logap.logitrack.repository.ManutencaoRepository;
import com.logap.logitrack.repository.ViagemRepository;

@Service
public class DashboardService {

    private final ViagemRepository viagemRepository;
    private final ManutencaoRepository manutencaoRepository;

    public DashboardService(ViagemRepository viagemRepository, ManutencaoRepository manutencaoRepository) {
        this.viagemRepository = viagemRepository;
        this.manutencaoRepository = manutencaoRepository;
    }

    public DashboardDTO obterDadosDashboard() {
        DashboardDTO dto = new DashboardDTO();

        // 1. Total de KM percorrido
        BigDecimal totalKm = viagemRepository.findTotalKmPercorrido();
        dto.setTotalKmPercorrido(totalKm != null ? totalKm : BigDecimal.ZERO);

        // 2. Volume por Categoria (Leve vs Pesado)
        List<Object[]> volumeResultado = viagemRepository.findVolumePorCategoria();
        Map<String, Long> volumeMap = new HashMap<>();
        for (Object[] linha : volumeResultado) {
            String categoria = (String) linha[0];
            Long totalViagens = ((Number) linha[1]).longValue();
            volumeMap.put(categoria, totalViagens);
        }
        dto.setVolumePorCategoria(volumeMap);

        // 3. Cronograma de Manutenção (Próximas 5 manutenções)
        dto.setProximasManutencoes(manutencaoRepository.findProximasManutencoes());

        // 4. Ranking de Utilização (Veículo com maior KM acumulado)
        List<Object[]> rankingResultado = viagemRepository.findVeiculoMaiorKM();
        Map<String, Object> veiculoMap = new HashMap<>();
        if (!rankingResultado.isEmpty()) {
            Object[] veiculoResultado = rankingResultado.get(0);
            veiculoMap.put("placa", veiculoResultado[0]);
            veiculoMap.put("modelo", veiculoResultado[1]);
            veiculoMap.put("totalKm", veiculoResultado[2]);
        }
        dto.setVeiculoMaiorKm(veiculoMap);

        // 5. Projeção Financeira (Soma dos custos do mês atual)
        LocalDate hoje = LocalDate.now();
        BigDecimal custoMes = manutencaoRepository.findCustoTotalPorMesEAno(hoje.getMonthValue(), hoje.getYear());
        dto.setCustoTotalMesAtual(custoMes != null ? custoMes : BigDecimal.ZERO);

        return dto;
    }
}
