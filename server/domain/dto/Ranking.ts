import { Summary } from "../Summary.ts";

export class Ranking {
  constructor(public best: Summary[], public worst: Summary[]) {}
}
