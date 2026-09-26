package com.logap.logitrack.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.logap.logitrack.domain.entity.Manutencao;

@Repository
public interface ManutencaoRepository extends JpaRepository<Manutencao, Integer> {

    @Query(value = "SELECT * FROM manutencoes " +
                   "WHERE status != 'CONCLUIDA' AND data_inicio >= CURRENT_DATE " +
                   "ORDER BY data_inicio ASC LIMIT 5", nativeQuery = true)
    List<Manutencao> findProximasManutencoes();

    @Query(value = "SELECT COALESCE(SUM(custo_estimado), 0) FROM manutencoes " +
                   "WHERE EXTRACT(MONTH FROM data_inicio) = :mes " +
                   "AND EXTRACT(YEAR FROM data_inicio) = :ano", nativeQuery = true)
    BigDecimal findCustoTotalPorMesEAno(@Param("mes") int mes, @Param("ano") int ano);
}