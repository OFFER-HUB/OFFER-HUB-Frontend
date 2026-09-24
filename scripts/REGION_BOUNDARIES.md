# Region Boundaries Documentation

Este archivo documenta las coordenadas exactas de cada región en el SVG del mapa (viewBox: 1240 x 431).

## Coordenadas por Región

### North America (Norteamérica)
- **Top rows**: x < 500, y < 100
- **Main area**: x < 450, y < 180
- Incluye: USA, Canadá, México, Alaska, Groenlandia, Ártico

### Central America & Caribbean (Centroamérica y Caribe)
- **Coordinates**: x < 320, y >= 180 && y < 240
- Incluye: Guatemala, Costa Rica, Panamá, Cuba, Jamaica, etc.

### South America (Sudamérica)
- **Coordinates**: x < 360, y >= 240
- Incluye: Argentina, Brasil, Colombia, Chile, Perú, etc.

### Europe (Europa)
- **Northern region (Scandinavia)**: x >= 500 && x < 600, y < 100
- **Top band**: x >= 450 && x < 700, y >= 100 && y < 140
- **Center**: x >= 450 && x < 620, y >= 100 && y < 175
- Incluye: España, Francia, Alemania, UK, Noruega, Suecia, etc.

### Africa (África)
- **Atlantic islands**: x >= 420 && x < 480, y >= 200 && y < 260
- **Main area**: x >= 450 && x < 700, y >= 165 && y < 420
- Incluye: Nigeria, Sudáfrica, Egipto, Kenia, etc.

### Middle East (Medio Oriente)
- **Coordinates**: x >= 580 && x < 720, y >= 140 && y < 250
- Incluye: Arabia Saudita, Israel, Irán, UAE, etc.

### Asia
- **Top rows (Siberia)**: x >= 600, y < 100
- **Large area**: x >= 600, y < 290
- **Southeast islands**: x >= 750, y >= 200 && y < 320
- Incluye: China, India, Japón, Tailandia, Indonesia, etc.

### Oceania
- **Coordinates**: x >= 800, y >= 250
- Incluye: Australia, Nueva Zelanda, Fiji, etc.

## Polígonos Eliminados

- **Stray polygons**: x < 50, y > 150 && y < 350
- Estos no representaban ninguna ubicación geográfica real

## Notas

- Las regiones se verifican en orden de prioridad (top-down en la función)
- Oceania se verifica primero para evitar overlap con Asia
- Europa se verifica antes de África en ciertas áreas
- El sistema usa el primer punto del polígono para determinar la región
