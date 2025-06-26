![Banner Plannit](https://raw.githubusercontent.com/amorima/projeto1/refs/heads/main/.github/img/repositorio/BANNER_PLANIT.png)

# PlanIt - Planeador de Viagens Inteligente ✈️🌍

[![Licença: MIT](https://img.shields.io/badge/Licença-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Issues Abertas](https://img.shields.io/github/issues/amorima/projeto1)](https://github.com/amorima/projeto1/issues)
[![Forks](https://img.shields.io/github/forks/amorima/projeto1?style=social)](https://github.com/amorima/projeto1/network/members)
[![Stars](https://img.shields.io/github/stars/amorima/projeto1?style=social)](https://github.com/amorima/projeto1/stargazers)
[![Último Commit](https://img.shields.io/github/last-commit/amorima/projeto1)](https://github.com/amorima/projeto1/commits/main)

**PlanIt** é um projeto académico inovador desenvolvido no âmbito da Licenciatura em Tecnologias e Sistemas de Informação para a Web da ESMAD | P.PORTO.
O nosso objetivo é criar um planeador de viagens inteligente, focado na personalização, acessibilidade e inclusão, simplificando todo o processo de organização de viagens.

> Não complique, PlanIt!

## ✨ Sobre o Projeto

Num mercado com crescente procura por experiências personalizadas, o PlanIt surge como uma plataforma intuitiva e responsiva que se adapta às necessidades únicas de cada viajante. Desde o planeamento inicial até à concretização da viagem, simplificamos a pesquisa de alojamento, transporte e atividades, oferecendo sugestões personalizadas e filtros inclusivos (como acessibilidade para mobilidade reduzida).

Para além disso, incorporamos mecânicas de **gamificação** para tornar a experiência mais envolvente e recompensadora, fomentando a lealdade e a interação na nossa comunidade de viajantes.

### 🎯 Objetivos Principais

* Oferecer uma experiência de utilização fluida e agradável.
* Construir uma marca fiável, coesa e moderna.
* Fornecer recomendações personalizadas com base no tipo de turismo e necessidades individuais (incluindo acessibilidade e inclusão).
* Implementar mecanismos de gamificação para aumentar o envolvimento e a fidelização.

## 🚀 Funcionalidades Principais

* **Pesquisa de Voos:** Sistema completo de pesquisa e reserva de voos com múltiplas companhias aéreas.
* **Reserva de Alojamento:** Explore e reserve hotéis em destinos europeus com filtros personalizados.
* **Aluguer de Automóveis:** Serviço integrado de aluguer de carros para maior autonomia nas viagens.
* **Descoberta de Atividades:** Catálogo de experiências e atividades turísticas organizadas por destino.
* **Tipos de Turismo:** Especialização em diferentes modalidades como turismo cultural, bem-estar e eco-turismo.
* **Sistema de Gamificação (RewardIt):** Ganhe pontos, medalhas e recompensas através das suas viagens e atividades.
* **Painel Administrativo:** Interface completa para gestão de utilizadores, destinos, voos, hotéis e atividades.
* **Modo Escuro/Claro:** Interface adaptável com suporte completo para preferências visuais.
* **Design Responsivo:** Experiência otimizada para dispositivos móveis, tablets e computadores.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com as seguintes tecnologias principais:

* **Frontend:** Tailwind, HTML, CSS, JavaScript
* **Base de Dados:** localStorage
* **Prototipagem e Design:** Figma, Illustrator
* **Gestão de Projeto:** Notion, GitHub Projects
* **Controlo de Versão:** Git & GitHub

## 🔑 Informações de Estágio

Para testar a plataforma, utilize os seguintes acessos:

### Perfil de Utilizador
* **Email:** 40240119@esmad.ipp.pt
* **Palavra-passe:** 40240119

### Perfil de Administrador
* **Email:** 40240137@esmad.ipp.pt
* **Palavra-passe:** 40240137

## 👌O grupo

* **António Amorim:** [GitHub](https://github.com/amorima)
* **Gabriel Paiva:** [GitHub](https://github.com/Gabriel-S-Paiva)
* **Henrique Silva:** [GitHub](https://github.com/HenReis)

Link do Projeto: [https://github.com/amorima/projeto1/](https://github.com/amorima/projeto1/)

## 🙏 Agradecimentos

* Escola Superior de Media Artes e Design (ESMAD)
* Politécnico do Porto (P.PORTO)

* Prof. Doutor Mário Pinto [GitHub](https://github.com/amorima)
* Prof. Doutor Ricardo Queirós [GitHub](https://github.com/mariopinto18)
* Prof. António Machado

# 🧪 Cenários de Teste: Porto → Londres

## 📋 **Dados Adicionados ao Sistema**

Foram adicionados voos específicos para testar todos os tipos de viagem entre Porto (OPO) e Londres (LHR).

---

## 🎯 **CENÁRIO 1: SÓ IDA - Turismo Cultural**

### **Pesquisa:**
- **Origem:** Porto (OPO)
- **Destino:** Londres (LHR)
- **Tipo:** Só ida
- **Data de Partida:** 05/07/2025
- **Tipo de Turismo:** Turismo Cultural
- **Acessibilidade:** Acesso Sem Degraus

### **Resultado Esperado:**
- ✈️ **Voo:** BA1001 - British Airways
- 🕘 **Partida:** 05/07/2025 às 06:30
- 🕐 **Chegada:** 05/07/2025 às 08:30
- 💰 **Preço:** €200
- ♿ **Acessibilidade:** Acesso Sem Degraus, Elevadores Disponíveis

---

## 🎯 **CENÁRIO 2: SÓ IDA - Turismo Urbano**

### **Pesquisa:**
- **Origem:** Porto (OPO)
- **Destino:** Londres (LHR)
- **Tipo:** Só ida
- **Data de Partida:** 21/10/2025
- **Tipo de Turismo:** Turismo Urbano
- **Acessibilidade:** Transporte Acessível

### **Resultado Esperado:**
- ✈️ **Voo:** EZ9101 - easyJet
- 🕐 **Partida:** 21/10/2025 às 08:30
- 🕔 **Chegada:** 21/10/2025 às 11:00
- 💰 **Preço:** €120
- ♿ **Acessibilidade:** Transporte Acessível, Casas de Banho Adaptadas

---

## 🎯 **CENÁRIO 3: IDA E VOLTA - Turismo de Negócios**

### **Pesquisa:**
- **Origem:** Porto (OPO)
- **Destino:** Londres (LHR)
- **Tipo:** Ida e volta
- **Data de Partida:** 05/07/2025
- **Data de Regresso:** 07/07/2025
- **Tipo de Turismo:** Turismo de Negócios
- **Acessibilidade:** Elevadores Disponíveis

### **Resultado Esperado:**
- ✈️ **Voo de Ida:** BA1001 - British Airways
- 🕘 **Partida:** 05/07/2025 às 06:30
- 🕙 **Chegada:** 05/07/2025 às 08:30
- ✈️ **Voo de Volta:** BA1002 - British Airways
- 🕕 **Partida:** 07/07/2025 às 14:00
- 🕗 **Chegada:** 07/07/2025 às 16:00
- 💰 **Preço Total:** €410 (€200 + €210)
- ♿ **Acessibilidade:** Elevadores Disponíveis, Aluguer de Equipamento de Mobilidade

---

## 🎯 **CENÁRIO 4: SÓ IDA - Preço Baixo**

### **Pesquisa:**
- **Origem:** Porto (OPO)
- **Tipo:** Só ida
- **Acessibilidade:** Acesso Sem Degraus
- **Filtro de Preço:** Máximo €80

### **Resultado Esperado:**
- ✈️ **Voo:** TP2456 - TAP
- 🕕 **Partida:** 01/07/2025 às 08:15
- 🕗 **Chegada:** 01/07/2025 às 09:10
- 💰 **Preço:** €75
- ♿ **Acessibilidade:** Acesso Sem Degraus

---

## 🎯 **CENÁRIO 5: MULTIVIAGEM - Porto → Londres → Paris**

### **Pesquisa:**
- **Origem:** Porto (OPO)
- **Destino Final:** Paris (CDG)
- **Tipo:** Multiviagem
- **Escala:** Londres (LHR)
- **Tipo de Turismo:** Turismo Cultural
- **Acessibilidade:** Transporte Acessível

### **Resultado Esperado:**
- ✈️ **Segmento 1:** BA1001 - British Airways (Porto → Londres)
- 🕘 **Partida:** 05/07/2025 às 06:30
- 🕙 **Chegada:** 05/07/2025 às 08:30
- ✈️ **Segmento 2:** FR305 - Ryanair (Londres → Paris)
- 🕓 **Partida:** 02/08/2025 às 14:00
- 🕕 **Chegada:** 02/08/2025 às 18:00
- 💰 **Preço Total:** €295
- ♿ **Acessibilidade:** Transporte Acessível, Elevadores Disponíveis

---

## 🎯 **CENÁRIO 6: MULTIVIAGEM - Porto → Londres → Paris → Roma**

### **Pesquisa no Sistema:**
- **Origem:** Porto (OPO)
- **Escala 1:** Londres (LHR) 
- **Escala 2:** Paris (CDG)
- **Destino Final:** Roma (FCO)
- **Tipo:** Multiviagem
- **Tipo de Turismo:** Turismo Cultural, Turismo Urbano

### **Voos Individuais que Compõem a Viagem:**
1. **BA2025** - Porto (OPO) → Londres (LHR)
   - 🕘 **Partida:** 05/07/2025 às 06:30
   - 🕙 **Chegada:** 05/07/2025 às 08:30
   - ✈️ **Companhia:** British Airways
   - 💰 **Preço:** €200

2. **AF1234** - Londres (LHR) → Paris (CDG)
   - 🕓 **Partida:** 02/08/2025 às 14:00
   - 🕕 **Chegada:** 02/08/2025 às 18:00
   - ✈️ **Companhia:** Ryanair
   - 💰 **Preço:** €95

3. **LH567** - Paris (CDG) → Roma (FCO)
   - 🕗 **Partida:** 27/09/2025 às 10:30
   - 🕘 **Chegada:** 27/09/2025 às 12:00
   - ✈️ **Companhia:** EasyJet
   - 💰 **Preço:** €125

### **Resultado Esperado:**
- 🆔 **ID da Viagem:** BA1001-FR305-OP1012
- 🗺️ **Rota Completa:** Porto → Londres → Paris → Roma
- 💰 **Preço Total:** €420
- 🎯 **Tipo:** Multi-destino
- ♿ **Acessibilidade:** Transporte Acessível, Elevadores Disponíveis

---

## 🧪 **Como Testar:**

### **1. Limpar dados anteriores:**
```javascript
// Na consola do browser:
localStorage.clear();
location.reload();
```

### **2. Fazer as pesquisas na página:**
1. Aceder à página de pesquisa de voos
2. Selecionar "Porto" como origem e "Londres" como destino
3. Configurar cada cenário conforme descrito
4. Verificar se os resultados coincidem com os esperados

### **3. Verificar funcionalidades:**
- ✅ Filtros de tipo de turismo
- ✅ Filtros de acessibilidade
- ✅ Filtros de preço
- ✅ Ordenação por data/preço
- ✅ Botão "Limpar filtros"
- ✅ Diferentes tipos de viagem

---

## 🎉 **Resultados de Teste Esperados:**

- **SÓ IDA sem filtros:** 4 voos disponíveis
- **IDA E VOLTA:** 1 combinação completa disponível
- **MULTIVIAGEM:** 1 rota com escala disponível
- **Filtros funcionais:** Resultados reduzem conforme filtros aplicados
- **Datas específicas:** Apenas voos da data selecionada aparecem
- **Sem datas:** Todos os voos da rota aparecem

---

### **Como Testar:**

#### **Método 1: URL Direta**
```
flight_itinerary.html?id=BA2025-AF1234-LH567
```

#### **Método 2: Através do Perfil do Utilizador**
1. Fazer login com `40240119@esmad.ipp.pt` / `40240119`
2. Ir para o perfil → aba "Reservas"
3. Clicar no card da viagem multitrip "Roma"

#### **Método 3: Pesquisa Multiviagem (Funcionalidade Futura)**
*Nota: Atualmente não existe interface de pesquisa multiviagem. Os utilizadores acedem através de reservas existentes ou URLs diretas.*

---

## 🗺️ **AEROPORTOS DISPONÍVEIS NO SISTEMA**

### **Principais Aeroportos para Testes:**

| Código | Cidade | País | Nome Completo |
|--------|--------|------|---------------|
| **OPO** | Porto | Portugal | Aeroporto Francisco Sá Carneiro |
| **LIS** | Lisboa | Portugal | Aeroporto Humberto Delgado |
| **LHR** | Londres | Reino Unido | Heathrow Airport |
| **LGW** | Londres | Reino Unido | Gatwick Airport |
| **STN** | Londres | Reino Unido | Stansted Airport |
| **CDG** | Paris | França | Charles de Gaulle |
| **ORY** | Paris | França | Orly Airport |
| **MAD** | Madrid | Espanha | Adolfo Suárez Madrid-Barajas |
| **FCO** | Roma | Itália | Leonardo da Vinci-Fiumicino |
| **AMS** | Amesterdão | Países Baixos | Amsterdam Airport Schiphol |

### **Como Usar na Pesquisa:**
- **No campo Origem:** Selecionar "Porto" (será automaticamente OPO)
- **No campo Destino:** Selecionar "Londres", "Paris", "Roma", etc.
- **Para testes específicos:** Usar os códigos nas URLs diretas

---

---

## 🔗 **URLs DE TESTE DIRETAS**

### **Viagens de Teste Rápido:**

#### **Voos Únicos (Só Ida):**
```
flight_itinerary.html?id=BA2025    # Porto → Londres (British Airways)
flight_itinerary.html?id=TP1205    # Porto → Londres (TAP)
flight_itinerary.html?id=RY3456    # Porto → Londres (Ryanair)
```

#### **Viagens Ida e Volta:**
```
flight_itinerary.html?id=EZY4080-EZY4081    # Porto ⇄ Londres (easyJet)
flight_itinerary.html?id=BA2025-TP1205      # Porto ⇄ Londres (Mixed)
```

#### **Viagens Multitrip:**
```
flight_itinerary.html?id=BA2025-AF1234-LH567    # Porto → Londres → Paris → Roma
```

### **Como Usar:**
1. Copiar qualquer URL acima
2. Colar na barra de endereços
3. Verificar se mostra os dados corretos
4. Testar funcionalidades de reserva e favoritos

---

*📝 Nota: Estes dados foram especificamente criados para demonstrar todas as funcionalidades do sistema de pesquisa de voos.*