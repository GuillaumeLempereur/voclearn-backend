-- Create the DB Voclearn

--CREATE DATABASE VocLearn_test;

USE VocLearn_test;

CREATE TABLE Stats(User int, WordId_1 int, WordId_2 int, Score_1 float, Score_2 float, Score_3 float, Score_inv_1 float, Score_inv_2 float, Score_inv_3 float, Date bigint, HalfLife smallint, Status boolean, PRIMARY KEY(User, WordId_1, WordId_2));

CREATE TABLE Languages(Id int AUTO_INCREMENT, Code VARCHAR(10), Lang VARCHAR(20), PRIMARY KEY(Id));

CREATE TABLE Users(Id int AUTO_INCREMENT, Login VARCHAR(12), FirstName VARCHAR(20), LastName VARCHAR(20), Pwd VARCHAR(255), LearntLang TINYINT, MasteredLang TINYINT, ReverseLangMode TINYINT, Difficulty boolean, PRIMARY KEY(Id), UNIQUE(Login));

CREATE TABLE Words(Id int, Word VARCHAR(32), LanguageId int, Gender TINYINT, Article VARCHAR(5), PRIMARY KEY(Id), UNIQUE(Word, LanguageId, Gender, Article));

CREATE TABLE Translations(WordId_1 int, WordId_2 int, LangId_1 TINYINT, LangId_2 TINYINT, Explanation_1 VARCHAR(128), Explanation_2 VARCHAR(128), Transliteration_1 VARCHAR(32), Transliteration_2 VARCHAR(32), PRIMARY KEY(WordId_1, WordId_2));
