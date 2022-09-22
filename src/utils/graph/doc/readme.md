# Graph library

## Principle

The library is massively using the [observer design patern](https://en.wikipedia.org/wiki/Observer_pattern) for all interactions with the library. You can then listen all modifications to the graph structure.

You can also add "MetaData" to all element of the graph (graph, node and link) and listen all modification of the values of metadata.

## Usage

### Visualisation component

When you implement a visualisation component, all function of element positioning/drawing has to be added as listener of the graph and your redraw function may just redraw the element that has been modified. You may not have to make a loop into the graph to redraw all elements at each frame.

### Graph Algorithm

Algorithms that have to assign values to nodes or links have to use metadata to be readable/listenable by other components like visualisation components or other intern graph algorithm.

### Save/Load Json

You can save and load your graph or some metadata of your graph to json files.
