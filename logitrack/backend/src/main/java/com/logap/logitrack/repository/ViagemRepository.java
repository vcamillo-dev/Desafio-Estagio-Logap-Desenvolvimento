package com.logap.logitrack.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.logap.logitrack.domain.entity.Viagem;

@Repository
public interface ViagemRepository extends JpaRepository<Viagem, Integer> {

    List<Viagem> findByVeiculo_IdOrderByDataSaidaDesc(Integer veiculoId);

    @Query("SELECT COALESCE(SUM(viagem.kmPercorrida), 0) FROM Viagem viagem WHERE viagem.veiculo.id = :veiculoId")
    BigDecimal somarDistanciaDoVeiculo(@Param("veiculoId") Integer veiculoId);

    // Total de Km percorrido por toda frota de veiculos
    @Query(value = "SELECT COALESCE(SUM(km_percorrida), 0) FROM viagens", nativeQuery = true)
    BigDecimal findTotalKmPercorrido();

    // Quantidade e categoria dos veiculos, sendo PESADO ou LEVE
    @Query(value = "SELECT veiculos.tipo, COUNT(viagens.id) "
            + "FROM veiculos "
            + "LEFT JOIN viagens ON veiculos.id = viagens.veiculo_id "
            + "GROUP BY veiculos.tipo", nativeQuery = true)
    List<Object[]> findVolumePorCategoria();

    // Ranking de KM'S rodados dos veiculos
    @Query(value = "SELECT veiculos.placa, veiculos.modelo, COALESCE(SUM(viagens.km_percorrida), 0) "
            + "FROM veiculos LEFT JOIN viagens ON veiculos.id = viagens.veiculo_id "
            + "GROUP BY veiculos.id, veiculos.placa, veiculos.modelo "
            + "ORDER BY COALESCE(SUM(viagens.km_percorrida), 0) DESC LIMIT 1", nativeQuery = true)
    List<Object[]> findVeiculoMaiorKM();
}
