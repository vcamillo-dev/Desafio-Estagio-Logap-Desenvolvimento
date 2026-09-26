package com.logap.logitrack.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import com.logap.logitrack.domain.entity.Manutencao;

public class DashboardDTO {

    private BigDecimal totalKmPercorrido;
    private Map<String, Long> volumePorCategoria;
    private List<Manutencao> proximasManutencoes;
    private Map<String, Object> veiculoMaiorKm;
    private BigDecimal custoTotalMesAtual;

    public DashboardDTO() {}

    public BigDecimal getTotalKmPercorrido() {
        return totalKmPercorrido;
    }

    public void setTotalKmPercorrido(BigDecimal totalKmPercorrido) {
        this.totalKmPercorrido = totalKmPercorrido;
    }

    public Map<String, Long> getVolumePorCategoria() {
        return volumePorCategoria;
    }

    public void setVolumePorCategoria(Map<String, Long> volumePorCategoria) {
        this.volumePorCategoria = volumePorCategoria;
    }

    public List<Manutencao> getProximasManutencoes() {
        return proximasManutencoes;
    }

    public void setProximasManutencoes(List<Manutencao> proximasManutencoes) {
        this.proximasManutencoes = proximasManutencoes;
    }

    public Map<String, Object> getVeiculoMaiorKm() {
        return veiculoMaiorKm;
    }

    public void setVeiculoMaiorKm(Map<String, Object> veiculoMaiorKm) {
        this.veiculoMaiorKm = veiculoMaiorKm;
    }

    public BigDecimal getCustoTotalMesAtual() {
        return custoTotalMesAtual;
    }

    public void setCustoTotalMesAtual(BigDecimal custoTotalMesAtual) {
        this.custoTotalMesAtual = custoTotalMesAtual;
    }
}