# Especificação Técnica — Animação Orgânica de Ondas na Praia com SVG + GSAP (versão avançada)

## Objetivo

Criar uma animação contínua de ondas avançando sobre a praia usando SVG + GSAP com aparência natural.

A animação deve evitar o efeito de "loop mecânico" através de:

* múltiplos conjuntos de ondas;
* ciclos sobrepostos;
* variação de velocidade;
* espuma independente;
* atrasos físicos entre água e espuma;
* iluminação dinâmica.

---

# Princípio Geral

A animação não deve seguir:

```
onda → recua totalmente → próxima onda
```

Esse padrão parece artificial.

O comportamento desejado:

```
onda A recua parcialmente
        ↓
onda B começa a avançar
        ↓
onda C aparece antes da anterior terminar
```

O mar deve parecer uma sequência contínua.

---

# Arquitetura de Camadas

## Camada 1 — Água Principal

Responsável pelo volume da onda.

Estrutura:

3 conjuntos independentes:

```
Wave Set A
Wave Set B
Wave Set C
```

Cada conjunto possui:

```
back
mid
front
```

Total:

```
9 SVGs
```

---

# Estados da Água

## back

Representa:

* água recuada;
* areia exposta;
* baixa transparência;
* pouco volume.

---

## mid

Representa:

* onda chegando;
* aumento de volume;
* começo de transparência.

---

## front

Representa:

* avanço máximo;
* água espalhada;
* maior transparência;
* espuma intensa.

---

# Morphing da Água

Cada conjunto usa:

```
back → mid → front
```

Mas nunca retorna obrigatoriamente para seu próprio back.

Exemplo:

```
Wave A:

A-back
 ↓
A-mid
 ↓
A-front


Wave B inicia antes:

B-back
 ↓
B-mid
 ↓
B-front
```

---

# Variação entre Ondas

Cada conjunto deve ter diferenças:

## Altura

```
Wave A: 100%
Wave B: 92%
Wave C: 108%
```

---

## Duração

Exemplo:

```
Wave A: 4.8s
Wave B: 5.3s
Wave C: 4.4s
```

---

## Alcance

O limite máximo deve variar.

Nunca usar o mesmo ponto final.

---

# Timeline Principal

Uma única timeline mestre.

Estrutura:

```
MASTER TIMELINE

├── Wave A
├── Wave B
├── Wave C
├── Foam
├── Residual Foam
├── Wet Sand
└── Lighting
```

---

# Movimento da Água

## Avanço

Características:

* rápido no início;
* perde energia;
* desacelera no final.

GSAP:

```
ease: power3.out
```

Exemplo:

```
back → mid

0.8s


mid → front

1.4s
```

---

## Permanência no limite

Duração:

```
300ms - 800ms
```

Não deve ser fixa.

Variar entre ciclos.

---

## Retorno

Características:

* começa lento;
* acelera conforme a água volta.

GSAP:

```
ease: power3.in
```

---

# Camada 2 — Transparência da Água

A água deve ficar mais transparente conforme avança.

Controlar:

```
opacity
fill-opacity
gradient stop-opacity
```

Valores:

```
back:

1.0


mid:

0.65


front:

0.25 - 0.4
```

---

A transparência deve acompanhar o avanço, mas com pequeno atraso:

```
água chega
↓
transparência aumenta
```

Delay:

```
100ms - 300ms
```

---

# Camada 3 — Espuma de Borda

A espuma não deve ser morph totalmente presa à água.

Terá:

```
foam-front-1
foam-front-2
foam-front-3
```

Total:

```
3 SVGs
```

Função:

* acompanhar a crista;
* variar aparência;
* evitar repetição.

---

# Animação da Espuma

Entrada:

atraso:

```
100ms - 300ms
```

após a água.

Propriedades:

```
opacity
scale
blur
position
```

---

Saída:

mais lenta que a água:

```
500ms - 1500ms
```

---

# Camada 4 — Espuma Residual

Muito importante para realismo.

Representa:

* espuma deixada na areia;
* rastros;
* pequenas bolhas.

Terá:

```
foam-residual-1
foam-residual-2
foam-residual-3
foam-residual-4
foam-residual-5
foam-residual-6
```

Total:

```
6 SVGs
```

---

Comportamento:

Surge:

quando a onda chega ao limite.

Permanece:

durante parte do recuo.

Desaparece:

lentamente.

---

Nunca sincronizar exatamente.

Exemplo:

```
onda recuou 80%

espuma ainda 40%
```

---

# Camada 5 — Areia Molhada

Terá:

```
Wave A:
A-wet-back
A-wet-mid
A-wet-front

Wave B:
B-wet-back
B-wet-mid
B-wet-front

Wave C:
C-wet-back
C-wet-mid
C-wet-front
```

Total:

```
9 SVGs
```

---

Comportamento:

A areia molhada:

* avança depois da água;
* recua depois da água.

Delay:

entrada:

```
200ms - 500ms
```

saída:

```
800ms - 2000ms
```

---

## Water stain / marca de recuo

Uma camada quase invisível:

water-mark-A.svg
water-mark-B.svg
water-mark-C.svg

Opacidade:

0.05 - 0.15

Ela deixa a areia parecer úmida mesmo depois da onda voltar.

# Camada 6 — Reflexos e Iluminação

## Reflexo da superfície

SVG separado.

Animar:

```
opacity
translateX
```

Movimento lento.

---

## Brilho solar

Pequenos shapes:

```
highlight-1
highlight-2
highlight-3
```

Animar:

```
opacity
scale
```

Baixa intensidade.

---

# Paleta

## Água profunda

```
#1B6CA8
```

---

## Água rasa

```
#5EC8FF
```

---

## Espuma

```
#FFFFFF
```

---

## Areia molhada

Mistura:

```
opacity 20%-40%
```

---

# Estrutura Final de Arquivos

```
waves/

water/
 ├─ A-back.svg
 ├─ A-mid.svg
 ├─ A-front.svg
 ├─ B-back.svg
 ├─ B-mid.svg
 ├─ B-front.svg
 ├─ C-back.svg
 ├─ C-mid.svg
 └─ C-front.svg


foam/
 ├─ edge-1.svg
 ├─ edge-2.svg
 ├─ edge-3.svg
 ├─ residual-1.svg
 ├─ residual-2.svg
 ├─ residual-3.svg
 ├─ residual-4.svg
 ├─ residual-5.svg
 └─ residual-6.svg


sand/
 ├─ A-wet-back.svg
 ├─ A-wet-mid.svg
 ├─ A-wet-front.svg
 ├─ A-wet-back.svg
 ├─ A-wet-mid.svg
 ├─ A-wet-front.svg
 ├─ A-wet-back.svg
 ├─ A-wet-mid.svg
 └─ A-wet-front.svg
```

---

# Resultado Esperado

O observador deve perceber:

* ondas diferentes chegando;
* nenhuma repetição óbvia;
* água com peso e inércia;
* espuma atrasada;
* areia reagindo;
* brilho e transparência naturais.

O realismo vem principalmente de:

1. sobreposição temporal;
2. variação de ciclos;
3. espuma independente;
4. atrasos físicos.

Não de simplesmente adicionar mais morphs.
