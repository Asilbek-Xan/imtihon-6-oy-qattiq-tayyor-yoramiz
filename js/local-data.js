import { ui } from "./ui.js";


export let localData = null;


export function changeLocalData(value){
    localData = value;
    ui(localData);
}