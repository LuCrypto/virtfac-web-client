<template>
  <v-container class="pa-6">
    <v-card elevation="3" class="mx-auto mb-6">
      <v-card-title>Contradiction Analysis</v-card-title>
      <v-card-subtitle></v-card-subtitle>
      <v-card-text class="text-justify">
        <h4>Introduction to the analysis of contradictions</h4>
        <br />
        TRIZ (Russian acronym for Theory of Inventive Problem Solving, Teorija
        Reshenija Izobretateliskih Zadatch) is a heuristic approach intended to
        solve innovation problems, mainly technical ones. It was developed in
        1946 by the Soviet engineer Genrich Altshuller, when he noticed that
        technological progress generally follows a course course describable by
        laws. These laws suggest a procedure to follow in order to innovate in
        the field of technology, notably by exploring generic solutions,
        borrowed from other fields, which have not yet been have not yet been
        applied to the particular problem at hand.
        <br />
        <h4>Introduction to TRIZ</h4>
        <br />
        <p>
          TRIZ considers that problems encountered during the design of a
          product have analogies with others and that similar solutions should
          be applicable to similar solutions should be applicable. This is the
          result of analysis of a large number of patents by the author of the
          theory and his team.
        </p>
        <p>
          The ambition of TRIZ is to foster creativity, or to stimulate the
          innovative concepts by offering engineers and inventors tools to
          unlock inventors with tools to unlock mental inertia. Based on the
          creativity, TRIZ orients the designer and guides him at each step of
          the each step of the problem solving process, by systematically
          proposing generic solutions generic solutions and proven tools, which
          allows the designer to benefit from the experience gained in different
          fields of activity and the simple fundamental principles the simple
          fundamentals that have been learned from them. TRIZ leads the user to
          a generic and abstract formulation of his problem, then to problem,
          and then to principles for solving the abstract problem intended to
          inspire inventive solutions in the real problem space. problem space.
          Based on hints and suggestions provided by TRIZ, the designer
          transposes generic solutions into concrete solutions adapted to his
          problem. TRIZ is based on the analysis of 40,000 patents selected from
          400,000. They have the characteristic of presenting common principles
          of innovation, and this in very varied fields. In concrete terms, TRIZ
          makes it possible to resolve antinomies that arise during a new
          design, such as in the field of engines such as in the field of
          engines, the conflicting demands of weight and the conflicting
          requirements of weight and power, or in computing, the conflict
          conflict between execution speed and memory footprint. The tools TRIZ
          tools are particularly used in France in the automotive and aerospace
          industries. industry, but applications to other sectors are common.
          other sectors are frequent. They can be used to solve inventiveness
          inventiveness problems, to prepare patent applications, but also to
          prepare prepare R&amp;D strategies.
        </p>
        <p>
          The result of the patent analysis highlighted three key elements of
          TRIZ:
        </p>
        <ol>
          <li>
            The solutions and problems are the same in all industrial and
            scientific sectors industry and science;
          </li>
          <li>
            The patterns of technical evolution are also repeated in all
            industrial and scientific The patterns of technical evolution are
            also repeated in all industrial and scientific sectors;
          </li>
          <li>
            Innovations use scientific effects outside the field in which they
            were developed. Innovations use scientific effects outside the field
            in which they were developed.
          </li>
        </ol>
        <br />
        <p>
          These findings led G. Altshuller to develop an approach to solving
          inventive problems. In this approach, the initial problem is not
          solved the initial problem directly, but goes through a phase of
          abstraction of the of abstraction of the problem allowing the
          construction of a generic problem from the initial problem, in the
          form of contradictions. This phase of This abstraction phase thus
          makes it possible to obtain a problem that is independent of the the
          domain of the initial problem, which makes it possible to obtain
          scientific effects effects outside the domain in which they were
          developed (according to the third key element). (in accordance with
          the third key element).
        </p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class AboutContradictionAnalysis extends Vue {}
</script>
