CREATE DATABASE ExpertSoft;

USE ExpertSoft


CREATE TABLE status(ID_status INT AUTO_INCREMENT PRIMARY KEY,status_name
VARCHAR(50),description VARCHAR(300));

CREATE TABLE platform (ID_platform INT AUTO_INCREMENT PRIMARY KEY,platform_name VARCHAR(50),platform_type VARCHAR(50),active boolean);

CREATE TABLE customer (ID_customer INT AUTO_INCREMENT PRIMARY KEY,first_name VARCHAR(50),last_name VARCHAR(50),active boolean);

CREATE TABLE invoice(ID_invoice int AUTO_INCREMENT PRIMARY key, amount_paid DECIMAL(10,2),billing_period VARCHAR(50),invoice_amount DECIMAL(10,2),))

CREATE TABLE transaction (ID_transaction INT AUTO_INCREMENT PRIMARY KEY,ID_customer INT,ID_status INT,ID_ platform INT,ID_invoice INT,trasaction_datetime DATE,transaction_type VARCHAR(50),transaction_amount DECIMAL(10,2),FOREIGN key transaction(ID_customer) REFERENCES customer(ID_customer),FOREIGN key transaction(ID_status) REFERENCES status(ID_status),FOREIGN key transaction(ID_platform) REFERENCES platform(ID_platform),FOREIGN key transaction(ID_invoice) REFERENCES invoice(ID_invoice));