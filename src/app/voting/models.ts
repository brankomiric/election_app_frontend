export interface CandidatesResponse {
  candidates: Candidate[];
}

export interface Candidate {
  name: string;
  age: number;
  cult: number;
  address: string;
  votes: number;
}
