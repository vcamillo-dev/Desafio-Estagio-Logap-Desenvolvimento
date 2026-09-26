-- 1. Criação da Tabela de Veículos
CREATE TABLE IF NOT EXISTS veiculos (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(10) UNIQUE NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    tipo VARCHAR(20) CHECK (tipo IN ('LEVE', 'PESADO')), -- Exemplo de constraint
    ano INTEGER
);

-- 2. Criação da Tabela de Viagens
CREATE TABLE IF NOT EXISTS viagens (
    id SERIAL PRIMARY KEY,
    veiculo_id INTEGER REFERENCES veiculos(id) ON DELETE CASCADE,
    data_saida TIMESTAMP NOT NULL,
    data_chegada TIMESTAMP,
    origem VARCHAR(100),
    destino VARCHAR(100),
    km_percorrida DECIMAL(10,2)
);

-- 3. Criação da Tabela de Manutenções
CREATE TABLE IF NOT EXISTS manutencoes (
    id SERIAL PRIMARY KEY,
    veiculo_id INTEGER REFERENCES veiculos(id) ON DELETE CASCADE,
    data_inicio DATE NOT NULL,
    data_finalizacao DATE,
    tipo_servico VARCHAR(100),
    custo_estimado DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'PENDENTE' -- PENDENTE, EM_REALIZACAO, CONCLUIDA
);

-- Inserindo Veículos
INSERT INTO veiculos (placa, modelo, tipo, ano) VALUES 
('ABC-1234', 'Fiorino', 'LEVE', 2022),
('XYZ-9876', 'Volvo FH', 'PESADO', 2021),
('KJG-1122', 'Mercedes Sprinter', 'LEVE', 2020),
('LMN-4455', 'Scania R500', 'PESADO', 2023)
ON CONFLICT (placa) DO NOTHING;

-- Inserindo Viagens (Para testar o Dashboard)
INSERT INTO viagens (veiculo_id, data_saida, data_chegada, origem, destino, km_percorrida)
SELECT veiculo.id, exemplo.data_saida, exemplo.data_chegada, exemplo.origem, exemplo.destino, exemplo.km_percorrida
FROM (VALUES
    ('ABC-1234', TIMESTAMP '2024-05-01 08:00:00', TIMESTAMP '2024-05-01 18:00:00', 'São Paulo', 'Rio de Janeiro', 435.00),
    ('ABC-1234', TIMESTAMP '2024-05-05 09:00:00', TIMESTAMP '2024-05-05 12:00:00', 'Rio de Janeiro', 'Niterói', 20.50),
    ('XYZ-9876', TIMESTAMP '2024-05-02 05:00:00', TIMESTAMP '2024-05-03 20:00:00', 'Curitiba', 'Belo Horizonte', 1000.00)
) AS exemplo(placa, data_saida, data_chegada, origem, destino, km_percorrida)
JOIN veiculos veiculo ON veiculo.placa = exemplo.placa
WHERE NOT EXISTS (
    SELECT 1
    FROM viagens existente
    WHERE existente.veiculo_id = veiculo.id
      AND existente.data_saida = exemplo.data_saida
      AND existente.data_chegada IS NOT DISTINCT FROM exemplo.data_chegada
      AND existente.origem IS NOT DISTINCT FROM exemplo.origem
      AND existente.destino IS NOT DISTINCT FROM exemplo.destino
      AND existente.km_percorrida IS NOT DISTINCT FROM exemplo.km_percorrida
);

-- Inserindo Manutenções (Para testar o Cronograma e Custos)
INSERT INTO manutencoes (veiculo_id, data_inicio, data_finalizacao, tipo_servico, custo_estimado, status)
SELECT veiculo.id, exemplo.data_inicio, exemplo.data_finalizacao, exemplo.tipo_servico, exemplo.custo_estimado, exemplo.status
FROM (VALUES
    ('ABC-1234', DATE '2024-06-10', DATE '2024-06-11', 'Troca de Óleo', 350.00, 'PENDENTE'),
    ('XYZ-9876', DATE '2024-06-15', DATE '2024-06-17', 'Revisão de Freios', 1500.00, 'PENDENTE'),
    ('KJG-1122', DATE '2024-05-20', DATE '2024-05-20', 'Troca de Pneus', 2200.00, 'CONCLUIDA')
) AS exemplo(placa, data_inicio, data_finalizacao, tipo_servico, custo_estimado, status)
JOIN veiculos veiculo ON veiculo.placa = exemplo.placa
WHERE NOT EXISTS (
    SELECT 1
    FROM manutencoes existente
    WHERE existente.veiculo_id = veiculo.id
      AND existente.data_inicio = exemplo.data_inicio
      AND existente.data_finalizacao IS NOT DISTINCT FROM exemplo.data_finalizacao
      AND existente.tipo_servico IS NOT DISTINCT FROM exemplo.tipo_servico
      AND existente.custo_estimado IS NOT DISTINCT FROM exemplo.custo_estimado
      AND existente.status IS NOT DISTINCT FROM exemplo.status
);

-- Completa os dados de demonstração para haver pelo menos 8 veículos,
-- 8 viagens e 8 manutenções no total.
INSERT INTO veiculos (placa, modelo, tipo, ano) VALUES
    ('QWE-1001', 'Renault Master', 'LEVE', 2022),
    ('RTY-2202', 'Volkswagen Delivery 11.180', 'PESADO', 2022),
    ('UIO-3303', 'Fiat Ducato', 'LEVE', 2021),
    ('PAS-4404', 'Mercedes-Benz Actros', 'PESADO', 2023)
ON CONFLICT (placa) DO NOTHING;

-- Mais 5 viagens; a verificação evita duplicar os exemplos ao executar o arquivo novamente.
INSERT INTO viagens (veiculo_id, data_saida, data_chegada, origem, destino, km_percorrida)
SELECT veiculo.id, exemplo.data_saida, exemplo.data_chegada, exemplo.origem,
       exemplo.destino, exemplo.km_percorrida
FROM (VALUES
    ('KJG-1122', TIMESTAMP '2025-01-12 07:30:00', TIMESTAMP '2025-01-12 12:20:00', 'Natal', 'Mossoró', 280.00),
    ('LMN-4455', TIMESTAMP '2025-02-03 06:00:00', TIMESTAMP '2025-02-04 17:00:00', 'Natal', 'Recife', 290.00),
    ('QWE-1001', TIMESTAMP '2025-03-18 08:15:00', TIMESTAMP '2025-03-18 14:30:00', 'João Pessoa', 'Natal', 185.50),
    ('RTY-2202', TIMESTAMP '2025-04-07 05:00:00', TIMESTAMP '2025-04-08 16:00:00', 'Fortaleza', 'Salvador', 1028.00),
    ('UIO-3303', TIMESTAMP '2025-05-22 09:00:00', TIMESTAMP '2025-05-22 13:10:00', 'Recife', 'João Pessoa', 120.00)
) AS exemplo(placa, data_saida, data_chegada, origem, destino, km_percorrida)
JOIN veiculos veiculo ON veiculo.placa = exemplo.placa
WHERE NOT EXISTS (
    SELECT 1
    FROM viagens existente
    WHERE existente.veiculo_id = veiculo.id
      AND existente.data_saida = exemplo.data_saida
      AND existente.data_chegada IS NOT DISTINCT FROM exemplo.data_chegada
      AND existente.origem IS NOT DISTINCT FROM exemplo.origem
      AND existente.destino IS NOT DISTINCT FROM exemplo.destino
      AND existente.km_percorrida IS NOT DISTINCT FROM exemplo.km_percorrida
);

-- Mais 5 manutenções futuras para preencher o cronograma e a projeção do mês.
-- Os nomes de serviço funcionam como chave natural para evitar duplicatas em reexecuções.
INSERT INTO manutencoes (veiculo_id, data_inicio, data_finalizacao, tipo_servico, custo_estimado, status)
SELECT veiculo.id, exemplo.data_inicio, exemplo.data_finalizacao, exemplo.tipo_servico,
       exemplo.custo_estimado, exemplo.status
FROM (VALUES
    ('ABC-1234', CURRENT_DATE,     CURRENT_DATE + 1, 'Revisão preventiva (demo)', 480.00, 'PENDENTE'),
    ('XYZ-9876', CURRENT_DATE + 2, CURRENT_DATE + 3, 'Inspeção de segurança (demo)', 1250.00, 'PENDENTE'),
    ('KJG-1122', CURRENT_DATE + 4, CURRENT_DATE + 5, 'Troca de filtros (demo)', 320.00, 'PENDENTE'),
    ('LMN-4455', CURRENT_DATE + 6, CURRENT_DATE + 7, 'Alinhamento e balanceamento (demo)', 690.00, 'PENDENTE'),
    ('QWE-1001', CURRENT_DATE + 8, CURRENT_DATE + 9, 'Revisão do sistema elétrico (demo)', 850.00, 'PENDENTE')
) AS exemplo(placa, data_inicio, data_finalizacao, tipo_servico, custo_estimado, status)
JOIN veiculos veiculo ON veiculo.placa = exemplo.placa
WHERE NOT EXISTS (
    SELECT 1
    FROM manutencoes existente
    WHERE existente.veiculo_id = veiculo.id
      AND existente.tipo_servico = exemplo.tipo_servico
);

