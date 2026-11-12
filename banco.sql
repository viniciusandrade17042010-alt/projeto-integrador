projeto_integrador-- Criação do Banco de Dados
CREATE DATABASE IF NOT EXISTS projeto_integrador;
USE projeto_integrador;

-- 1. Tabela Cliente:
CREATE TABLE cliente (  
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefone VARCHAR(20)
);

-- 2. Tabela Cadastro:
CREATE TABLE cadastro (
    id_cadastro INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
);

-- 3. Tabela Login:
CREATE TABLE login (
    id_login INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    email_acesso VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    verificado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
);

-- 4. Tabela Consulta (Atendimento/Suporte Técnico):
CREATE TABLE consulta (
    id_consulta INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    assunto VARCHAR(100) NOT NULL,
    mensagem TEXT NOT NULL,
    data_consulta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
);

-- 5. Tabela Produto:
CREATE TABLE produto (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    nome_produto VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    estoque INT NOT NULL
);
-- 6. Tabela Carrinho de Compra:
CREATE TABLE carrinho_de_compra (
    id_carrinho INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_produto) REFERENCES produto(id_produto)
);

-- 7. Tabela Venda:
CREATE TABLE venda (
    id_venda INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valor_total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
);

-- 8. Tabela Nota Fiscal:
CREATE TABLE nota_fiscal (
    id_nota INT AUTO_INCREMENT PRIMARY KEY,
    id_venda INT NOT NULL UNIQUE,
    chave_acesso VARCHAR(44) NOT NULL UNIQUE,
    data_emissao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valor_impostos DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_venda) REFERENCES venda(id_venda)
);projeto_integrador

SELECT * FROM cliente;

DESC cliente;

ALTER TABLE cliente
ADD endereco VARCHAR(100);

ALTER TABLE cliente
MODIFY COLUMN endereco VARCHAR(100) NOT NULL;

INSERT INTO cliente (id_cliente, nome_usuario, cpf, email, telefone, endereco) VALUES("1", "iago", "593.873.328-61", "iagostoso@gmail.com", "11978015861", "Rua IAGOSTOSO123");

