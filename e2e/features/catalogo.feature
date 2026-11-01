# Caso de la suite "Catalogo" de Azure Test Plans,
# ahora expresado en Gherkin para automatizarlo.
# Nota: las palabras clave de Gherkin van en ingles (Feature/Scenario/Given/When/Then)
# porque es lo que pytest-bdd entiende; el TEXTO de los pasos va en espanol.
Feature: Filtrar el catalogo por categoria
  Como cliente de la tienda
  quiero filtrar los productos por categoria
  para encontrar mas rapido lo que busco

  # @TC20 = ID del Test Case en Azure Test Plans (enlaza el resultado al caso).
  @catalogo @smoke @TC20
  Scenario: Filtrar productos por categoria Hogar
    Given que abro la home de la tienda
    When filtro el catalogo por la categoria "hogar"
    Then solo veo productos de la categoria "hogar"
    And la cantidad de productos visibles es mayor que cero

  @catalogo @edge
  Scenario: Buscar un producto inexistente en el catalogo
    Given que abro la home de la tienda
    When busco un producto con el texto "ProductoQueNoExiste"
    Then no veo resultados en el catalogo
