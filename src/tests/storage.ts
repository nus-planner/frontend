import "reflect-metadata";
import { instanceToPlain } from "class-transformer";
import { MainViewModel } from "../models/mapping";

const plain = instanceToPlain(new MainViewModel(2019, 4));
console.log(plain);
