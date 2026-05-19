// pages/SeedBiblioteca.jsx
// Página temporária para popular a biblioteca de serviços.
// Após rodar o seed, pode remover a rota e este arquivo.
//
// Como usar:
//   1. Adicione em routes.jsx:
//      import SeedBiblioteca from "../pages/SeedBiblioteca";
//      <Route path="/gestor/:empresaId/seed" element={<ProtectedRoutes><SeedBiblioteca /></ProtectedRoutes>} />
//   2. Acesse: /gestor/A.V.M-AR-CAMPINAS/seed
//   3. Clique em "Popular Biblioteca"
//   4. Após concluir, remova a rota e este arquivo.

import { useState } from "react";
import { useParams } from "react-router-dom";
import { addDoc } from "firebase/firestore";
import { bibliotecaRef, catalogoRef } from "../config/firebasePaths";
import { EMPRESAID } from "../config/empresa";
import Header from "../components/Header";
import { toast } from "sonner";

// ─── Tabela Uniar Maio/2026 ───────────────────────────────────────────────────
// Campos: marca, modelo, tipo (FR=só fria / CR=quente+frio), categoria,
//         capacidadeBtu, tensao, codigo, custoUniar, referencia
const CATALOGO_UNIAR = [
  // ── MIDEA Hi-Wall FR ─────────────────────────────────────────────────────
  { marca:"Midea", modelo:"Air Volution Connect Barril", tipo:"FR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09FRMB2INN",   custoUniar:2546  },
  { marca:"Midea", modelo:"AI Air Volution Connect Barril", tipo:"FR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09FRMBINVAI", custoUniar:2546  },
  { marca:"Midea", modelo:"AI EcoMaster",     tipo:"FR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09FRMDECIN",  custoUniar:2861  },
  { marca:"Midea", modelo:"Xtreme Save Connect Horiz.", tipo:"FR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09FRMDCIN",   custoUniar:2861  },
  { marca:"Midea", modelo:"Air Volution Connect Barril", tipo:"FR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12FRMB2INN",   custoUniar:2911  },
  { marca:"Midea", modelo:"AI Air Volution Connect Barril", tipo:"FR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12FRMBINVAI", custoUniar:2911  },
  { marca:"Midea", modelo:"AI EcoMaster",     tipo:"FR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12FRMDECIN",  custoUniar:3261  },
  { marca:"Midea", modelo:"AI Air Volution Connect Barril", tipo:"FR", categoria:"hiwall", capacidadeBtu:18000, tensao:"220V", codigo:"HW18FRMBINVAI", custoUniar:4614  },
  { marca:"Midea", modelo:"AI EcoMaster",     tipo:"FR", categoria:"hiwall", capacidadeBtu:18000, tensao:"220V", codigo:"HW18FRMDECIN",  custoUniar:4515  },
  { marca:"Midea", modelo:"AI Air Volution Connect Barril", tipo:"FR", categoria:"hiwall", capacidadeBtu:22000, tensao:"220V", codigo:"HW24FRMB2INN",   custoUniar:6112  },
  { marca:"Midea", modelo:"AI EcoMaster",     tipo:"FR", categoria:"hiwall", capacidadeBtu:24000, tensao:"220V", codigo:"HW24FRMDECIN",  custoUniar:6852  },
  { marca:"Midea", modelo:"Xtreme Save Connect Horiz.", tipo:"FR", categoria:"hiwall", capacidadeBtu:30000, tensao:"220V", codigo:"HW30FRMDCIN",   custoUniar:8907  },
  // ── MIDEA Hi-Wall CR ─────────────────────────────────────────────────────
  { marca:"Midea", modelo:"AI EcoMaster",     tipo:"CR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09CRMDECIN",  custoUniar:3086  },
  { marca:"Midea", modelo:"Xtreme Save Connect Horiz.", tipo:"CR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12CRMDCIN",   custoUniar:3541  },
  { marca:"Midea", modelo:"AI EcoMaster",     tipo:"CR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12CRMDECIN",  custoUniar:3541  },
  { marca:"Midea", modelo:"AI Air Volution Connect Barril", tipo:"CR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12CRMBINVAI", custoUniar:3532  },
  { marca:"Midea", modelo:"Xtreme Save Connect Black Horiz.", tipo:"CR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12CRMDCINB",  custoUniar:3912  },
  { marca:"Midea", modelo:"AI EcoMaster",     tipo:"CR", categoria:"hiwall", capacidadeBtu:18000, tensao:"220V", codigo:"HW18CRMDECIN",  custoUniar:5649  },
  { marca:"Midea", modelo:"AI EcoMaster",     tipo:"CR", categoria:"hiwall", capacidadeBtu:24000, tensao:"220V", codigo:"HW24CRMDECIN",  custoUniar:7129  },
  { marca:"Midea", modelo:"Xtreme Save Connect Horiz.", tipo:"CR", categoria:"hiwall", capacidadeBtu:30000, tensao:"220V", codigo:"HW30CRMDCIN",   custoUniar:9330  },
  // ── ELGIN Hi-Wall FR ─────────────────────────────────────────────────────
  { marca:"Elgin", modelo:"Eco Inverter II c/Wi-Fi", tipo:"FR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09FRELECOIW", custoUniar:2538  },
  { marca:"Elgin", modelo:"Eco Dream c/Wi-Fi",       tipo:"FR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09FRELECD",   custoUniar:2538  },
  { marca:"Elgin", modelo:"Eco Inverter III c/Wi-Fi",tipo:"FR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09FRELECOIN",  custoUniar:3012  },
  { marca:"Elgin", modelo:"Eco Inverter II c/Wi-Fi", tipo:"FR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12FRELECOIW", custoUniar:2921  },
  { marca:"Elgin", modelo:"Eco Inverter III c/Wi-Fi",tipo:"FR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12FRELECOIN",  custoUniar:3444  },
  { marca:"Elgin", modelo:"Eco Inverter II c/Wi-Fi", tipo:"FR", categoria:"hiwall", capacidadeBtu:18000, tensao:"220V", codigo:"HW18FRELECOIW", custoUniar:5017  },
  { marca:"Elgin", modelo:"Eco Dream c/Wi-Fi",       tipo:"FR", categoria:"hiwall", capacidadeBtu:18000, tensao:"220V", codigo:"HW18FRELECD",   custoUniar:3838  },
  { marca:"Elgin", modelo:"Eco Inverter II c/Wi-Fi", tipo:"FR", categoria:"hiwall", capacidadeBtu:24000, tensao:"220V", codigo:"HW24FRELECOIW", custoUniar:6240  },
  { marca:"Elgin", modelo:"Eco Dream c/Wi-Fi",       tipo:"FR", categoria:"hiwall", capacidadeBtu:24000, tensao:"220V", codigo:"HW24FRELECD",   custoUniar:4781  },
  { marca:"Elgin", modelo:"Eco Inverter II c/Wi-Fi", tipo:"FR", categoria:"hiwall", capacidadeBtu:30000, tensao:"220V", codigo:"HW30FRELECOIW", custoUniar:8364  },
  { marca:"Elgin", modelo:"Eco Dream c/Wi-Fi",       tipo:"FR", categoria:"hiwall", capacidadeBtu:30000, tensao:"220V", codigo:"HW30FRELECD",   custoUniar:6614  },
  { marca:"Elgin", modelo:"Eco Dream c/Wi-Fi",       tipo:"FR", categoria:"hiwall", capacidadeBtu:36000, tensao:"220V", codigo:"HW36FRELECD",   custoUniar:10598 },
  // ── ELGIN Hi-Wall CR ─────────────────────────────────────────────────────
  { marca:"Elgin", modelo:"Eco Inverter II c/Wi-Fi", tipo:"CR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09CRELECOIW", custoUniar:2921  },
  { marca:"Elgin", modelo:"Eco Inverter III c/Wi-Fi",tipo:"CR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09CRELECOIN",  custoUniar:3329  },
  { marca:"Elgin", modelo:"Eco Inverter II c/Wi-Fi", tipo:"CR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12CRELECOIW", custoUniar:3666  },
  { marca:"Elgin", modelo:"Eco Dream c/Wi-Fi",       tipo:"CR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12CRELECD",   custoUniar:3148  },
  { marca:"Elgin", modelo:"Eco Inverter II c/Wi-Fi", tipo:"CR", categoria:"hiwall", capacidadeBtu:18000, tensao:"220V", codigo:"HW18CRELECOIW", custoUniar:5031  },
  { marca:"Elgin", modelo:"Eco Inverter II c/Wi-Fi", tipo:"CR", categoria:"hiwall", capacidadeBtu:24000, tensao:"220V", codigo:"HW24CRELECOIW", custoUniar:6309  },
  { marca:"Elgin", modelo:"Eco Dream c/Wi-Fi",       tipo:"CR", categoria:"hiwall", capacidadeBtu:24000, tensao:"220V", codigo:"HW24CRELECD",   custoUniar:5383  },
  { marca:"Elgin", modelo:"Eco Inverter II c/Wi-Fi", tipo:"CR", categoria:"hiwall", capacidadeBtu:30000, tensao:"220V", codigo:"HW30CRELECOIW", custoUniar:8804  },
  { marca:"Elgin", modelo:"Eco Dream c/Wi-Fi",       tipo:"CR", categoria:"hiwall", capacidadeBtu:36000, tensao:"220V", codigo:"HW36CRELECD",   custoUniar:11229 },
  // ── LG Hi-Wall FR ────────────────────────────────────────────────────────
  { marca:"LG", modelo:"Compact AI",       tipo:"FR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09FRLGCPAI",    custoUniar:2889  },
  { marca:"LG", modelo:"Dual Voice AI",    tipo:"FR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09FRLGINAI",    custoUniar:3123  },
  { marca:"LG", modelo:"Compact AI",       tipo:"FR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12FRLGCPAI",    custoUniar:3238  },
  { marca:"LG", modelo:"Dual Voice AI",    tipo:"FR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12FRLGINAI",    custoUniar:3598  },
  { marca:"LG", modelo:"Dual Voice ArtCool",tipo:"FR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12FRLGHDIARTN", custoUniar:4408  },
  { marca:"LG", modelo:"Compact AI",       tipo:"FR", categoria:"hiwall", capacidadeBtu:18000, tensao:"220V", codigo:"HW18FRLGCPAI",    custoUniar:4484  },
  { marca:"LG", modelo:"Dual Voice AI",    tipo:"FR", categoria:"hiwall", capacidadeBtu:18000, tensao:"220V", codigo:"HW18FRLGINAI",    custoUniar:4846  },
  { marca:"LG", modelo:"Dual Voice AI",    tipo:"FR", categoria:"hiwall", capacidadeBtu:24000, tensao:"220V", codigo:"HW24FRLGINAI",    custoUniar:6835  },
  { marca:"LG", modelo:"Dual Voice ArtCool",tipo:"FR", categoria:"hiwall", capacidadeBtu:24000, tensao:"220V", codigo:"HW24FRLGHDIARTN", custoUniar:7627  },
  // ── LG Hi-Wall CR ────────────────────────────────────────────────────────
  { marca:"LG", modelo:"Dual Voice AI",    tipo:"CR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09CRLGINAI",    custoUniar:3254  },
  { marca:"LG", modelo:"Dual Voice AI",    tipo:"CR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12CRLGINAI",    custoUniar:3828  },
  { marca:"LG", modelo:"Voice ArtCool UV Nano", tipo:"CR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12CRLGARTR",    custoUniar:4477  },
  { marca:"LG", modelo:"Dual Voice AI",    tipo:"CR", categoria:"hiwall", capacidadeBtu:18000, tensao:"220V", codigo:"HW18CRLGINAI",    custoUniar:5609  },
  { marca:"LG", modelo:"Voice ArtCool UV Nano", tipo:"CR", categoria:"hiwall", capacidadeBtu:18000, tensao:"220V", codigo:"HW18CRLGARTR",    custoUniar:6309  },
  { marca:"LG", modelo:"Dual Voice AI",    tipo:"CR", categoria:"hiwall", capacidadeBtu:24000, tensao:"220V", codigo:"HW24CRLGINAI",    custoUniar:7014  },
  { marca:"LG", modelo:"Voice ArtCool UV Nano", tipo:"CR", categoria:"hiwall", capacidadeBtu:24000, tensao:"220V", codigo:"HW24CRLGARTR",    custoUniar:7883  },
  { marca:"LG", modelo:"Dual Voice",       tipo:"CR", categoria:"hiwall", capacidadeBtu:28000, tensao:"220V", codigo:"HW30CRLGVINV",    custoUniar:11844 },
  { marca:"LG", modelo:"Dual Voice Horiz", tipo:"CR", categoria:"hiwall", capacidadeBtu:36000, tensao:"220V", codigo:"HW36CRLGVINV",    custoUniar:12903 },
  // ── SAMSUNG Hi-Wall FR ───────────────────────────────────────────────────
  { marca:"Samsung", modelo:"Digital Ultra AI",      tipo:"FR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09FRSAIN",     custoUniar:2855  },
  { marca:"Samsung", modelo:"Digital Wind Free AI",  tipo:"FR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09FRSAINAI",   custoUniar:3108  },
  { marca:"Samsung", modelo:"Horiz Digital Ultra",   tipo:"FR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12FRSAHINNU",  custoUniar:3261  },
  { marca:"Samsung", modelo:"Digital Ultra AI",      tipo:"FR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12FRSAIN",     custoUniar:3408  },
  { marca:"Samsung", modelo:"Digital Wind Free AI",  tipo:"FR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12FRSAINAI",   custoUniar:3717  },
  { marca:"Samsung", modelo:"Digital Ultra AI",      tipo:"FR", categoria:"hiwall", capacidadeBtu:18000, tensao:"220V", codigo:"HW18FRSAIN",     custoUniar:4414  },
  { marca:"Samsung", modelo:"Digital Wind Free AI",  tipo:"FR", categoria:"hiwall", capacidadeBtu:18000, tensao:"220V", codigo:"HW18FRSAINAI",   custoUniar:5001  },
  { marca:"Samsung", modelo:"Horiz Wind Free Connect",tipo:"FR",categoria:"hiwall", capacidadeBtu:22000, tensao:"220V", codigo:"HW24FRSAINWFNC", custoUniar:6523  },
  { marca:"Samsung", modelo:"Digital Ultra AI",      tipo:"FR", categoria:"hiwall", capacidadeBtu:24000, tensao:"220V", codigo:"HW24FRSAIN",     custoUniar:5758  },
  { marca:"Samsung", modelo:"Digital Wind Free AI",  tipo:"FR", categoria:"hiwall", capacidadeBtu:24000, tensao:"220V", codigo:"HW24FRSAINAI",   custoUniar:6820  },
  // ── SAMSUNG Hi-Wall CR ───────────────────────────────────────────────────
  { marca:"Samsung", modelo:"Digital Wind Free AI",  tipo:"CR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12CRSAINAI",   custoUniar:3864  },
  { marca:"Samsung", modelo:"Wind Free Black",       tipo:"CR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12CRSAMBLACK",  custoUniar:3998  },
  { marca:"Samsung", modelo:"Digital Wind Free AI",  tipo:"CR", categoria:"hiwall", capacidadeBtu:18000, tensao:"220V", codigo:"HW18CRSAINAI",   custoUniar:5435  },
  { marca:"Samsung", modelo:"Wind Free Black",       tipo:"CR", categoria:"hiwall", capacidadeBtu:18000, tensao:"220V", codigo:"HW18CRSAMBLACK",  custoUniar:5454  },
  { marca:"Samsung", modelo:"Horiz Wind Free Connect",tipo:"CR",categoria:"hiwall", capacidadeBtu:22000, tensao:"220V", codigo:"HW24CRSAINWFNC", custoUniar:7090  },
  { marca:"Samsung", modelo:"Digital Wind Free AI",  tipo:"CR", categoria:"hiwall", capacidadeBtu:24000, tensao:"220V", codigo:"HW24CRSAINAI",   custoUniar:7414  },
  { marca:"Samsung", modelo:"Wind Free Black",       tipo:"CR", categoria:"hiwall", capacidadeBtu:24000, tensao:"220V", codigo:"HW24CRSAMBLACK",  custoUniar:7306  },
  // ── FUJITSU Hi-Wall FR ───────────────────────────────────────────────────
  { marca:"Fujitsu", modelo:"Airstage Essencial", tipo:"FR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09FRFU2INRS",  custoUniar:2944  },
  { marca:"Fujitsu", modelo:"Premium",            tipo:"FR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09FRFU2INR",   custoUniar:3689  },
  { marca:"Fujitsu", modelo:"Premium",            tipo:"FR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12FRFU2INR",   custoUniar:4026  },
  { marca:"Fujitsu", modelo:"Premium",            tipo:"FR", categoria:"hiwall", capacidadeBtu:18000, tensao:"220V", codigo:"HW18FRFU2INR",   custoUniar:6444  },
  { marca:"Fujitsu", modelo:"Premium",            tipo:"FR", categoria:"hiwall", capacidadeBtu:24000, tensao:"220V", codigo:"HW24FRFU2INR",   custoUniar:7517  },
  { marca:"Fujitsu", modelo:"Premium",            tipo:"FR", categoria:"hiwall", capacidadeBtu:27000, tensao:"220V", codigo:"HW30FRFUJ2IN",   custoUniar:10593 },
  { marca:"Fujitsu", modelo:"Premium",            tipo:"FR", categoria:"hiwall", capacidadeBtu:31000, tensao:"220V", codigo:"HW36FRFUJ2IN",   custoUniar:11766 },
  // ── FUJITSU Hi-Wall CR ───────────────────────────────────────────────────
  { marca:"Fujitsu", modelo:"Airstage Essencial", tipo:"CR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09CRFU2INRS",  custoUniar:3271  },
  { marca:"Fujitsu", modelo:"Premium",            tipo:"CR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09CRFU2INR",   custoUniar:3961  },
  { marca:"Fujitsu", modelo:"Premium",            tipo:"CR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12CRFU2INR",   custoUniar:4038  },
  { marca:"Fujitsu", modelo:"Airstage Essencial", tipo:"CR", categoria:"hiwall", capacidadeBtu:18000, tensao:"220V", codigo:"HW18CRFU2INRS",  custoUniar:5604  },
  { marca:"Fujitsu", modelo:"Premium",            tipo:"CR", categoria:"hiwall", capacidadeBtu:18000, tensao:"220V", codigo:"HW18CRFU2INR",   custoUniar:6581  },
  { marca:"Fujitsu", modelo:"Premium",            tipo:"CR", categoria:"hiwall", capacidadeBtu:24000, tensao:"220V", codigo:"HW24CRFU2INR",   custoUniar:8289  },
  { marca:"Fujitsu", modelo:"Premium",            tipo:"CR", categoria:"hiwall", capacidadeBtu:27000, tensao:"220V", codigo:"HW30CRFUJ2IN",   custoUniar:12910 },
  { marca:"Fujitsu", modelo:"Premium",            tipo:"CR", categoria:"hiwall", capacidadeBtu:31000, tensao:"220V", codigo:"HW36CRFUJ2IN",   custoUniar:12695 },
  // ── DAIKIN Hi-Wall FR ────────────────────────────────────────────────────
  { marca:"Daikin", modelo:"Full R-32", tipo:"FR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09FRDKF",  custoUniar:4152  },
  { marca:"Daikin", modelo:"Full R-32", tipo:"FR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12FRDKF",  custoUniar:4768  },
  { marca:"Daikin", modelo:"Full R-32", tipo:"FR", categoria:"hiwall", capacidadeBtu:18000, tensao:"220V", codigo:"HW18FRDKF",  custoUniar:6643  },
  { marca:"Daikin", modelo:"Full R-32", tipo:"FR", categoria:"hiwall", capacidadeBtu:24000, tensao:"220V", codigo:"HW24FRDKF",  custoUniar:8027  },
  // ── DAIKIN Hi-Wall CR ────────────────────────────────────────────────────
  { marca:"Daikin", modelo:"EcoSwing Gold R-32", tipo:"CR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09CRDKH2IN", custoUniar:4186  },
  { marca:"Daikin", modelo:"Full R-32",          tipo:"CR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09CRDKF",    custoUniar:4683  },
  { marca:"Daikin", modelo:"EcoSwing Gold R-32", tipo:"CR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12CRDKH2IN", custoUniar:5231  },
  { marca:"Daikin", modelo:"Full R-32",          tipo:"CR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12CRDKF",    custoUniar:5506  },
  { marca:"Daikin", modelo:"EcoSwing Gold R-32", tipo:"CR", categoria:"hiwall", capacidadeBtu:18000, tensao:"220V", codigo:"HW18CRDKH2IN", custoUniar:7109  },
  { marca:"Daikin", modelo:"Full R-32",          tipo:"CR", categoria:"hiwall", capacidadeBtu:18000, tensao:"220V", codigo:"HW18CRDKF",    custoUniar:7640  },
  { marca:"Daikin", modelo:"Full R-32",          tipo:"CR", categoria:"hiwall", capacidadeBtu:24000, tensao:"220V", codigo:"HW24CRDKF",    custoUniar:9643  },
  // ── GREE Hi-Wall FR ──────────────────────────────────────────────────────
  { marca:"Gree", modelo:"G-Top",     tipo:"FR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09FRGRIN",  custoUniar:2585  },
  { marca:"Gree", modelo:"G-Diamond", tipo:"FR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09FRGRID",  custoUniar:3518  },
  { marca:"Gree", modelo:"G-Top",     tipo:"FR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12FRGRIN",  custoUniar:3011  },
  { marca:"Gree", modelo:"G-Diamond", tipo:"FR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12FRGRID",  custoUniar:4083  },
  { marca:"Gree", modelo:"G-Side",    tipo:"FR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12FRGRINS", custoUniar:3446  },
  { marca:"Gree", modelo:"G-Top",     tipo:"FR", categoria:"hiwall", capacidadeBtu:18000, tensao:"220V", codigo:"HW18FRGRIN",  custoUniar:4569  },
  { marca:"Gree", modelo:"G-Diamond", tipo:"FR", categoria:"hiwall", capacidadeBtu:18000, tensao:"220V", codigo:"HW18FRGRID",  custoUniar:5678  },
  { marca:"Gree", modelo:"G-Top",     tipo:"FR", categoria:"hiwall", capacidadeBtu:24000, tensao:"220V", codigo:"HW24FRGRIN",  custoUniar:6021  },
  { marca:"Gree", modelo:"G-Diamond", tipo:"FR", categoria:"hiwall", capacidadeBtu:24000, tensao:"220V", codigo:"HW24FRGRID",  custoUniar:7178  },
  { marca:"Gree", modelo:"G-Top",     tipo:"FR", categoria:"hiwall", capacidadeBtu:30000, tensao:"220V", codigo:"HW30FRGRIN",  custoUniar:8869  },
  // ── GREE Hi-Wall CR ──────────────────────────────────────────────────────
  { marca:"Gree", modelo:"G-Top",     tipo:"CR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09CRGRIN",  custoUniar:2981  },
  { marca:"Gree", modelo:"G-Diamond", tipo:"CR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09CRGRID",  custoUniar:3694  },
  { marca:"Gree", modelo:"G-Side",    tipo:"CR", categoria:"hiwall", capacidadeBtu:9000,  tensao:"220V", codigo:"HW09CRGRINS", custoUniar:3258  },
  { marca:"Gree", modelo:"G-Top",     tipo:"CR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12CRGRIN",  custoUniar:3043  },
  { marca:"Gree", modelo:"G-Diamond", tipo:"CR", categoria:"hiwall", capacidadeBtu:12000, tensao:"220V", codigo:"HW12CRGRID",  custoUniar:4289  },
  { marca:"Gree", modelo:"G-Top",     tipo:"CR", categoria:"hiwall", capacidadeBtu:18000, tensao:"220V", codigo:"HW18CRGRIN",  custoUniar:4938  },
  { marca:"Gree", modelo:"G-Diamond", tipo:"CR", categoria:"hiwall", capacidadeBtu:18000, tensao:"220V", codigo:"HW18CRGRID",  custoUniar:5966  },
  { marca:"Gree", modelo:"G-Top",     tipo:"CR", categoria:"hiwall", capacidadeBtu:24000, tensao:"220V", codigo:"HW24CRGRIN",  custoUniar:6346  },
  { marca:"Gree", modelo:"G-Diamond", tipo:"CR", categoria:"hiwall", capacidadeBtu:24000, tensao:"220V", codigo:"HW24CRGRID",  custoUniar:7538  },
  { marca:"Gree", modelo:"G-Top",     tipo:"CR", categoria:"hiwall", capacidadeBtu:30000, tensao:"220V", codigo:"HW30CRGRIN",  custoUniar:9520  },
  // ── PISO-TETO FR ─────────────────────────────────────────────────────────
  { marca:"Carrier", modelo:"Xperience R-410A",      tipo:"FR", categoria:"pisoteto", capacidadeBtu:30000, tensao:"220V", codigo:"PT30FRCAV2SFIO",  custoUniar:8767  },
  { marca:"Carrier", modelo:"Xpower Inverter c/Wi-Fi",tipo:"FR",categoria:"pisoteto", capacidadeBtu:30000, tensao:"220V", codigo:"PT30FRCAV2RP",    custoUniar:10847 },
  { marca:"Carrier", modelo:"Xpower Viper VS Inverter c/Wi-Fi",tipo:"FR",categoria:"pisoteto", capacidadeBtu:36000, tensao:"220V", codigo:"PT36FRCAV2INR",   custoUniar:11730 },
  { marca:"Midea",   modelo:"Inverter R-32 c/Wi-Fi", tipo:"FR", categoria:"pisoteto", capacidadeBtu:36000, tensao:"220V", codigo:"PT36FRMV2IN",    custoUniar:10803 },
  { marca:"Carrier", modelo:"Xpower Inverter c/Wi-Fi",tipo:"FR",categoria:"pisoteto", capacidadeBtu:36000, tensao:"220V", codigo:"PT36FRCAV2RP",    custoUniar:13292 },
  { marca:"Carrier", modelo:"Xpower Inverter c/Wi-Fi",tipo:"FR",categoria:"pisoteto", capacidadeBtu:48000, tensao:"220V", codigo:"PT48FRCAV2RP",    custoUniar:15706 },
  { marca:"Midea",   modelo:"Inverter R-32 c/Wi-Fi", tipo:"FR", categoria:"pisoteto", capacidadeBtu:60000, tensao:"220V", codigo:"PT60FRMV2IN",    custoUniar:14466 },
  { marca:"Carrier", modelo:"Xpower Inverter c/Wi-Fi",tipo:"FR",categoria:"pisoteto", capacidadeBtu:60000, tensao:"220V", codigo:"PT60FRCAV2RP",    custoUniar:16507 },
  { marca:"Elgin",   modelo:"Eco Inverter Horiz R-32",tipo:"FR",categoria:"pisoteto", capacidadeBtu:24000, tensao:"220V", codigo:"PT24FRELH2INV",   custoUniar:7760  },
  { marca:"Elgin",   modelo:"Eco Inverter Horiz R-32",tipo:"FR",categoria:"pisoteto", capacidadeBtu:30000, tensao:"220V", codigo:"PT30FRELH2INV",   custoUniar:9861  },
  { marca:"Elgin",   modelo:"Eco Inverter Horiz R-32",tipo:"FR",categoria:"pisoteto", capacidadeBtu:36000, tensao:"220V", codigo:"PT36FRELH2INV",   custoUniar:9769  },
  { marca:"Elgin",   modelo:"Eco Inverter Horiz R-32",tipo:"FR",categoria:"pisoteto", capacidadeBtu:48000, tensao:"220V", codigo:"PT48FRELH2INVR",  custoUniar:11690 },
  { marca:"Elgin",   modelo:"Inverter Wi-Fi Horiz",   tipo:"FR",categoria:"pisoteto", capacidadeBtu:56000, tensao:"220V", codigo:"PT60FRELH2INVW",  custoUniar:14169 },
  { marca:"Elgin",   modelo:"Eco Inverter Vert R-32", tipo:"FR",categoria:"pisoteto", capacidadeBtu:60000, tensao:"220V", codigo:"PT60FRELV2INV",   custoUniar:14169 },
  { marca:"LG",      modelo:"Inverter c/Wi-Fi",       tipo:"FR",categoria:"pisoteto", capacidadeBtu:36000, tensao:"220V", codigo:"PT36FRLGHINV2W",  custoUniar:10973 },
  { marca:"LG",      modelo:"Inverter c/Wi-Fi",       tipo:"FR",categoria:"pisoteto", capacidadeBtu:48000, tensao:"220V", codigo:"PT48FRLGHINV2W",  custoUniar:13553 },
  { marca:"LG",      modelo:"Inverter c/Wi-Fi",       tipo:"FR",categoria:"pisoteto", capacidadeBtu:54000, tensao:"220V", codigo:"PT60FRLGHINV2W",  custoUniar:15189 },
  { marca:"Gree",    modelo:"G-Prime Compact R-32",   tipo:"FR",categoria:"pisoteto", capacidadeBtu:36000, tensao:"220V", codigo:"PT36FRGRINV",     custoUniar:10461 },
  { marca:"Gree",    modelo:"G-Prime Compact R-32",   tipo:"FR",categoria:"pisoteto", capacidadeBtu:57000, tensao:"220V", codigo:"PT60FRGRINV",     custoUniar:13067 },
  // ── PISO-TETO CR ─────────────────────────────────────────────────────────
  { marca:"Carrier", modelo:"Xpower Inverter c/Wi-Fi", tipo:"CR", categoria:"pisoteto", capacidadeBtu:30000, tensao:"220V", codigo:"PT30CRCAV2RP",    custoUniar:10524 },
  { marca:"Carrier", modelo:"Xpower Inverter c/Wi-Fi", tipo:"CR", categoria:"pisoteto", capacidadeBtu:36000, tensao:"220V", codigo:"PT36CRCAV2RP",    custoUniar:13292 },
  { marca:"Carrier", modelo:"Xpower Inverter c/Wi-Fi", tipo:"CR", categoria:"pisoteto", capacidadeBtu:48000, tensao:"220V", codigo:"PT48CRCAV2RP",    custoUniar:16019 },
  { marca:"Carrier", modelo:"Xpower Inverter c/Wi-Fi", tipo:"CR", categoria:"pisoteto", capacidadeBtu:60000, tensao:"220V", codigo:"PT60CRCAV2RP",    custoUniar:17413 },
  { marca:"Elgin",   modelo:"Eco Inverter Horiz R-32", tipo:"CR", categoria:"pisoteto", capacidadeBtu:24000, tensao:"220V", codigo:"PT24CRELH2INV",   custoUniar:8584  },
  { marca:"Elgin",   modelo:"Eco Inverter Horiz R-32", tipo:"CR", categoria:"pisoteto", capacidadeBtu:30000, tensao:"220V", codigo:"PT30CRELH2INV",   custoUniar:9000  },
  { marca:"LG",      modelo:"Inverter Q/F c/Wi-Fi",    tipo:"CR", categoria:"pisoteto", capacidadeBtu:30000, tensao:"220V", codigo:"PT36CRLGHINV2W",  custoUniar:11306 },
  { marca:"LG",      modelo:"Inverter Q/F c/Wi-Fi R-32",tipo:"CR",categoria:"pisoteto", capacidadeBtu:36000, tensao:"220V", codigo:"PT36CRLGINV2R",   custoUniar:13229 },
  { marca:"LG",      modelo:"Inverter Q/F c/Wi-Fi R-32",tipo:"CR",categoria:"pisoteto", capacidadeBtu:48000, tensao:"220V", codigo:"PT48CRLGINV2R",   custoUniar:16192 },
  // ── CORTINA DE AR ─────────────────────────────────────────────────────────
  { marca:"Springer", modelo:"ACF09S5 CT Remoto 220V", tipo:"FR", categoria:"cortina", capacidadeBtu:0, tensao:"220V", codigo:"ACF09S5",       custoUniar:862,  descricaoExtra:"0,90m" },
  { marca:"Springer", modelo:"ACG12S5 CT Remoto 220V", tipo:"FR", categoria:"cortina", capacidadeBtu:0, tensao:"220V", codigo:"ACG12S5",       custoUniar:1086, descricaoExtra:"1,20m" },
  { marca:"Springer", modelo:"ACF15S5 CT Remoto 220V", tipo:"FR", categoria:"cortina", capacidadeBtu:0, tensao:"220V", codigo:"ACF15S5",       custoUniar:1354, descricaoExtra:"1,50m" },
  { marca:"Elgin",    modelo:"CT Remoto 220V",          tipo:"FR", categoria:"cortina", capacidadeBtu:0, tensao:"220V", codigo:"45CAD3009002",  custoUniar:829,  descricaoExtra:"0,90m" },
  { marca:"Elgin",    modelo:"CT Remoto 220V",          tipo:"FR", categoria:"cortina", capacidadeBtu:0, tensao:"220V", codigo:"45CAD3012002",  custoUniar:1080, descricaoExtra:"1,20m" },
  { marca:"Elgin",    modelo:"CT Remoto 220V",          tipo:"FR", categoria:"cortina", capacidadeBtu:0, tensao:"220V", codigo:"45CAD3015002",  custoUniar:1372, descricaoExtra:"1,50m" },
].map(p => ({ ...p, referencia: "Maio/2026" }));

// Cada serviço pré-preenche o wizard assim:
//   materiais  → tabela "Equipamentos" (o aparelho em si)
//   maoDeObra  → 1ª linha da tabela "Instalação / Serviço" (preço padrão por unid.)
// O usuário edita livremente no Step 3 do wizard antes de salvar.

const SERVICOS_FORNECIMENTO = [
  {
    nome: "Fornecimento Split Hi-Wall 9.000 BTU/h",
    categoria: "fornecimento",
    descricao: "Fornecimento de ar-condicionado Split Hi-Wall Só Fria 9.000 BTU/h, 220V/60Hz. Equipamento novo, em caixa lacrada, com Certificado INMETRO, Selo Procel A e Manual Técnico. Instalação não inclusa.",
    maoDeObra: 0, margemLucro: 30, valorPorMetroTubulacao: 0,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [], opcoesEquipamento: [],
  },
  {
    nome: "Fornecimento Split Hi-Wall 12.000 BTU/h",
    categoria: "fornecimento",
    descricao: "Fornecimento de ar-condicionado Split Hi-Wall Só Fria 12.000 BTU/h, 220V/60Hz. Equipamento novo, em caixa lacrada, com Certificado INMETRO, Selo Procel A e Manual Técnico. Instalação não inclusa.",
    maoDeObra: 0, margemLucro: 30, valorPorMetroTubulacao: 0,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [], opcoesEquipamento: [],
  },
  {
    nome: "Fornecimento Split Hi-Wall 18.000 BTU/h",
    categoria: "fornecimento",
    descricao: "Fornecimento de ar-condicionado Split Hi-Wall Só Fria 18.000 BTU/h, 220V/60Hz. Equipamento novo, em caixa lacrada, com Certificado INMETRO, Selo Procel A e Manual Técnico. Instalação não inclusa.",
    maoDeObra: 0, margemLucro: 30, valorPorMetroTubulacao: 0,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [], opcoesEquipamento: [],
  },
  {
    nome: "Fornecimento Split Hi-Wall 24.000 BTU/h",
    categoria: "fornecimento",
    descricao: "Fornecimento de ar-condicionado Split Hi-Wall Só Fria 24.000 BTU/h, 220V/60Hz. Equipamento novo, em caixa lacrada, com Certificado INMETRO, Selo Procel A e Manual Técnico. Instalação não inclusa.",
    maoDeObra: 0, margemLucro: 30, valorPorMetroTubulacao: 0,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [], opcoesEquipamento: [],
  },
  {
    nome: "Fornecimento Split Piso-Teto 36.000 BTU/h",
    categoria: "fornecimento",
    descricao: "Fornecimento de ar-condicionado Split Piso-Teto Só Fria 36.000 BTU/h, 220V/60Hz. Equipamento novo, em caixa lacrada, com Certificado INMETRO, Selo Procel A e Manual Técnico. Instalação não inclusa.",
    maoDeObra: 0, margemLucro: 28, valorPorMetroTubulacao: 0,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [], opcoesEquipamento: [],
  },
  {
    nome: "Fornecimento Split Piso-Teto 48.000 BTU/h",
    categoria: "fornecimento",
    descricao: "Fornecimento de ar-condicionado Split Piso-Teto Só Fria 48.000 BTU/h, 220V/60Hz. Equipamento novo, em caixa lacrada, com Certificado INMETRO, Selo Procel A e Manual Técnico. Instalação não inclusa.",
    maoDeObra: 0, margemLucro: 28, valorPorMetroTubulacao: 0,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [], opcoesEquipamento: [],
  },
  {
    nome: "Fornecimento Split Piso-Teto 60.000 BTU/h",
    categoria: "fornecimento",
    descricao: "Fornecimento de ar-condicionado Split Piso-Teto Só Fria 60.000 BTU/h, 220V/60Hz. Equipamento novo, em caixa lacrada, com Certificado INMETRO, Selo Procel A e Manual Técnico. Instalação não inclusa.",
    maoDeObra: 0, margemLucro: 28, valorPorMetroTubulacao: 0,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [], opcoesEquipamento: [],
  },
];

const SERVICOS_CORRETIVA = [
  {
    nome: "Manutenção Corretiva",
    categoria: "corretiva",
    descricao: "Diagnóstico e reparo de falha em sistema de ar-condicionado. Inclui visita técnica, identificação da falha, mão de obra de reparo e materiais de consumo. Peças de reposição cobradas à parte mediante aprovação.",
    maoDeObra: 280, margemLucro: 35, valorPorMetroTubulacao: 0,
    garantia: "90 dias",
    materiais: [], opcoesEquipamento: [],
  },
  {
    nome: "Manutenção Corretiva + Preventiva",
    categoria: "corretiva",
    descricao: "Manutenção corretiva (diagnóstico e reparo de falha) combinada com manutenção preventiva completa conforme ABNT NBR 16401. Inclui reparo, limpeza de filtros, evaporador, condensador, verificação de gás, dreno e relatório técnico.",
    maoDeObra: 380, margemLucro: 35, valorPorMetroTubulacao: 0,
    garantia: "90 dias",
    materiais: [], opcoesEquipamento: [],
  },
];

const SERVICOS = [
  {
    nome: "Instalação Split Hi-Wall 9.000 BTU/h",
    categoria: "instalacao",
    descricao: "Fornecimento e instalação de ar-condicionado Split Hi-Wall Só Fria 9.000 BTU/h, 220V/60Hz. Inclui suporte metálico novo, tubulação de cobre nova e isolada, cabo PB/PP, dreno em PVC, vácuo, carga de gás R-410A e testes de comissionamento. Execução conforme ABNT e NRs aplicáveis.",
    maoDeObra: 550, margemLucro: 30, valorPorMetroTubulacao: 35,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [
      { nome: "Split Hi-Wall Só Fria 9.000 BTU/h 220V/60Hz", qtd: 1, valorUnit: 1850 },
    ],
  },
  {
    nome: "Instalação Split Hi-Wall 12.000 BTU/h",
    categoria: "instalacao",
    descricao: "Fornecimento e instalação de ar-condicionado Split Hi-Wall Só Fria 12.000 BTU/h, 220V/60Hz. Inclui suporte metálico novo, tubulação de cobre nova e isolada, cabo PB/PP, dreno em PVC, vácuo, carga de gás R-410A e testes de comissionamento. Execução conforme ABNT e NRs aplicáveis.",
    maoDeObra: 650, margemLucro: 30, valorPorMetroTubulacao: 35,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [
      { nome: "Split Hi-Wall Só Fria 12.000 BTU/h 220V/60Hz", qtd: 1, valorUnit: 2100 },
    ],
  },
  {
    nome: "Instalação Split Hi-Wall 18.000 BTU/h",
    categoria: "instalacao",
    descricao: "Fornecimento e instalação de ar-condicionado Split Hi-Wall Só Fria 18.000 BTU/h, 220V/60Hz. Inclui suporte metálico novo, tubulação de cobre nova e isolada, cabo PB/PP, dreno em PVC, vácuo, carga de gás R-410A e testes de comissionamento. Execução conforme ABNT e NRs aplicáveis.",
    maoDeObra: 800, margemLucro: 30, valorPorMetroTubulacao: 38,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [
      { nome: "Split Hi-Wall Só Fria 18.000 BTU/h 220V/60Hz", qtd: 1, valorUnit: 2750 },
    ],
  },
  {
    nome: "Instalação Split Hi-Wall 24.000 BTU/h",
    categoria: "instalacao",
    descricao: "Fornecimento e instalação de ar-condicionado Split Hi-Wall Só Fria 24.000 BTU/h, 220V/60Hz. Inclui suporte metálico novo, tubulação de cobre nova e isolada, cabo PB/PP, dreno em PVC, vácuo, carga de gás R-410A e testes de comissionamento. Execução conforme ABNT e NRs aplicáveis.",
    maoDeObra: 950, margemLucro: 30, valorPorMetroTubulacao: 40,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [
      { nome: "Split Hi-Wall Só Fria 24.000 BTU/h 220V/60Hz", qtd: 1, valorUnit: 3450 },
    ],
  },
  {
    nome: "Instalação Split Piso-Teto 36.000 BTU/h",
    categoria: "instalacao",
    descricao: "Fornecimento e instalação de ar-condicionado Split Piso-Teto Só Fria 36.000 BTU/h, 220V/60Hz. Inclui suporte metálico novo, tubulação de cobre nova e isolada, canaleta, cabo PB/PP, dreno em PVC, bomba de condensado, vácuo, carga de gás R-410A e testes de comissionamento. Execução conforme ABNT e NRs aplicáveis.",
    maoDeObra: 1800, margemLucro: 28, valorPorMetroTubulacao: 45,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [
      { nome: "Split Piso-Teto Só Fria 36.000 BTU/h 220V/60Hz", qtd: 1, valorUnit: 5500 },
    ],
  },
  {
    nome: "Instalação Split Piso-Teto 48.000 BTU/h",
    categoria: "instalacao",
    descricao: "Fornecimento e instalação de ar-condicionado Split Piso-Teto Só Fria 48.000 BTU/h, 220V/60Hz. Inclui suporte metálico novo, tubulação de cobre nova e isolada, canaleta, cabo PB/PP, dreno em PVC, bomba de condensado, vácuo, carga de gás R-410A e testes de comissionamento. Execução conforme ABNT e NRs aplicáveis.",
    maoDeObra: 2200, margemLucro: 28, valorPorMetroTubulacao: 48,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [
      { nome: "Split Piso-Teto Só Fria 48.000 BTU/h 220V/60Hz", qtd: 1, valorUnit: 7000 },
    ],
  },
  {
    nome: "Instalação Split Piso-Teto 60.000 BTU/h",
    categoria: "instalacao",
    descricao: "Fornecimento e instalação de ar-condicionado Split Piso-Teto Só Fria 60.000 BTU/h, 220V/60Hz. Inclui suporte metálico novo, tubulação de cobre nova e isolada, canaleta, cabo PB/PP, dreno em PVC, bomba de condensado Elgin FP2210, vácuo, carga de gás R-410A e testes de comissionamento. Execução conforme ABNT (NBR 5410, 14136 e 16401) e NRs aplicáveis, com visita técnica prévia e APR/PT quando necessário. Equipe uniformizada com crachá DSTr/Unicamp.",
    maoDeObra: 2650, margemLucro: 28, valorPorMetroTubulacao: 50,
    garantia: "12 meses peças / 36 meses compressor",
    materiais: [
      { nome: "Split Piso-Teto Só Fria 60.000 BTU/h 220V/60Hz", qtd: 1, valorUnit: 8824.50 },
    ],
  },
  {
    nome: "Manutenção Preventiva",
    categoria: "manutencao",
    descricao: "Manutenção preventiva conforme ABNT NBR 16401 e Portaria 3.523/MS. Inclui limpeza de filtros, evaporador, condensador, verificação de gás, dreno, tensões elétricas e relatório técnico.",
    maoDeObra: 180, margemLucro: 35, valorPorMetroTubulacao: 0,
    garantia: "90 dias",
    materiais: [],
  },
  {
    nome: "Higienização Completa",
    categoria: "higienizacao",
    descricao: "Higienização completa com desmontagem total, lavagem com bactericida/fungicida homologado pela ANVISA, secagem e remontagem. Emissão de laudo técnico.",
    maoDeObra: 280, margemLucro: 35, valorPorMetroTubulacao: 0,
    garantia: "90 dias",
    materiais: [],
  },
  {
    nome: "PMOC – Plano de Manutenção, Operação e Controle",
    categoria: "pmoc",
    descricao: "Elaboração e execução do PMOC conforme Portaria 3.523/98 MS e ABNT NBR 16401. Inspeção de todos os equipamentos, relatório, registro CREA e ART quando aplicável.",
    maoDeObra: 450, margemLucro: 30, valorPorMetroTubulacao: 0,
    garantia: "Vigência do contrato",
    materiais: [],
  },
];

export default function SeedBiblioteca() {
  const { empresaId } = useParams();
  const eId = empresaId || EMPRESAID;

  const [rodando, setRodando]           = useState(false);
  const [log, setLog]                   = useState([]);
  const [concluido, setConcluido]       = useState(false);
  const [rodandoForn, setRodandoForn]       = useState(false);
  const [logForn, setLogForn]               = useState([]);
  const [concluidoForn, setConcluidoForn]   = useState(false);
  const [rodandoCat, setRodandoCat]         = useState(false);
  const [logCat, setLogCat]                 = useState([]);
  const [concluidoCat, setConcluidoCat]     = useState(false);
  const [rodandoCor, setRodandoCor]         = useState(false);
  const [logCor, setLogCor]                 = useState([]);
  const [concluidoCor, setConcluidoCor]     = useState(false);

  async function handleSeed() {
    setRodando(true);
    setLog([]);
    let ok = 0;

    for (const s of SERVICOS) {
      try {
        await addDoc(bibliotecaRef(eId), { ...s, criadoEm: new Date(), atualizadoEm: new Date() });
        setLog((p) => [...p, { tipo: "ok", msg: s.nome }]);
        ok++;
      } catch (e) {
        setLog((p) => [...p, { tipo: "erro", msg: `${s.nome}: ${e.message}` }]);
      }
    }

    setConcluido(true);
    setRodando(false);
    toast.success(`${ok}/${SERVICOS.length} serviços criados na biblioteca!`);
  }

  async function handleSeedFornecimento() {
    setRodandoForn(true);
    setLogForn([]);
    let ok = 0;
    for (const s of SERVICOS_FORNECIMENTO) {
      try {
        await addDoc(bibliotecaRef(eId), { ...s, criadoEm: new Date(), atualizadoEm: new Date() });
        setLogForn((p) => [...p, { tipo: "ok", msg: s.nome }]);
        ok++;
      } catch (e) {
        setLogForn((p) => [...p, { tipo: "erro", msg: `${s.nome}: ${e.message}` }]);
      }
    }
    setConcluidoForn(true);
    setRodandoForn(false);
    toast.success(`${ok}/${SERVICOS_FORNECIMENTO.length} serviços de fornecimento criados!`);
  }

  async function handleSeedCatalogo() {
    setRodandoCat(true);
    setLogCat([]);
    let ok = 0;
    for (const p of CATALOGO_UNIAR) {
      try {
        await addDoc(catalogoRef(eId), { ...p, criadoEm: new Date(), atualizadoEm: new Date() });
        setLogCat((prev) => [...prev, { tipo: "ok", msg: `${p.marca} ${p.modelo} ${p.capacidadeBtu ? p.capacidadeBtu + " BTU" : p.descricaoExtra || ""}` }]);
        ok++;
      } catch (e) {
        setLogCat((prev) => [...prev, { tipo: "erro", msg: `${p.codigo}: ${e.message}` }]);
      }
    }
    setConcluidoCat(true);
    setRodandoCat(false);
    toast.success(`${ok}/${CATALOGO_UNIAR.length} produtos adicionados ao catálogo!`);
  }

  async function handleSeedCorretiva() {
    setRodandoCor(true);
    setLogCor([]);
    let ok = 0;
    for (const s of SERVICOS_CORRETIVA) {
      try {
        await addDoc(bibliotecaRef(eId), { ...s, criadoEm: new Date(), atualizadoEm: new Date() });
        setLogCor((p) => [...p, { tipo: "ok", msg: s.nome }]);
        ok++;
      } catch (e) {
        setLogCor((p) => [...p, { tipo: "erro", msg: `${s.nome}: ${e.message}` }]);
      }
    }
    setConcluidoCor(true);
    setRodandoCor(false);
    toast.success(`${ok}/${SERVICOS_CORRETIVA.length} modelos de corretiva criados!`);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header title="Popular Biblioteca" />
      <main className="flex-grow p-4 max-w-lg mx-auto w-full">

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <p className="text-sm font-semibold text-amber-800 mb-1">⚠️ Use apenas uma vez</p>
          <p className="text-xs text-amber-700">
            Este utilitário cria os 10 serviços padrão AVM no Firestore. Se rodar mais de uma vez, irá duplicar os registros.
            Após concluir, remova a rota <code>/seed</code> do routes.jsx.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Serviços que serão criados:</p>
          <div className="space-y-1">
            {SERVICOS.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-4 h-4 rounded-full bg-gray-100 text-gray-400 text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                {s.nome}
              </div>
            ))}
          </div>
        </div>

        {log.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 space-y-1 max-h-48 overflow-y-auto">
            {log.map((l, i) => (
              <div key={i} className={`text-xs flex items-center gap-2 ${l.tipo === "ok" ? "text-green-700" : "text-red-600"}`}>
                <span>{l.tipo === "ok" ? "✓" : "✗"}</span>
                <span>{l.msg}</span>
              </div>
            ))}
          </div>
        )}

        {concluido ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <p className="text-sm font-semibold text-green-800 mb-1">✓ Biblioteca populada com sucesso!</p>
            <p className="text-xs text-green-700">
              Agora vá em <strong>Biblioteca de Serviços</strong> para conferir e ajustar os valores.
            </p>
          </div>
        ) : (
          <button onClick={handleSeed} disabled={rodando}
            className="w-full bg-[#1a5ea8] text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 active:scale-95 transition-all">
            {rodando ? `Criando serviços... (${log.length}/${SERVICOS.length})` : "Popular Biblioteca Agora"}
          </button>
        )}

        {/* ── Seção de Fornecimento ── */}
        <div className="mt-8 mb-3">
          <p className="text-sm font-bold text-gray-700">Serviços de Fornecimento</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Pode rodar mesmo que a biblioteca já tenha sido populada — adiciona apenas os modelos de "Fornecimento apenas" (sem instalação), com opções de marca por BTU.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
          <div className="space-y-1">
            {SERVICOS_FORNECIMENTO.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-400 text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                {s.nome}
              </div>
            ))}
          </div>
        </div>

        {logForn.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 space-y-1 max-h-40 overflow-y-auto">
            {logForn.map((l, i) => (
              <div key={i} className={`text-xs flex items-center gap-2 ${l.tipo === "ok" ? "text-green-700" : "text-red-600"}`}>
                <span>{l.tipo === "ok" ? "✓" : "✗"}</span>
                <span>{l.msg}</span>
              </div>
            ))}
          </div>
        )}

        {concluidoForn ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <p className="text-sm font-semibold text-green-800">✓ Serviços de fornecimento adicionados!</p>
            <p className="text-xs text-green-700 mt-1">
              Agora ao criar um orçamento, escolha um desses serviços no Step 2 — a seção de instalação some automaticamente.
            </p>
          </div>
        ) : (
          <button onClick={handleSeedFornecimento} disabled={rodandoForn}
            className="w-full bg-[#1a7a3a] text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 active:scale-95 transition-all">
            {rodandoForn
              ? `Criando... (${logForn.length}/${SERVICOS_FORNECIMENTO.length})`
              : "Adicionar Serviços de Fornecimento"}
          </button>
        )}
        {/* ── Seção Catálogo Uniar ── */}
        <div className="mt-8 mb-3">
          <p className="text-sm font-bold text-gray-700">Catálogo de Equipamentos Uniar</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Popula a coleção <code>catalogo</code> com {CATALOGO_UNIAR.length} produtos da tabela Uniar Maio/2026.
            Ao criar orçamentos de fornecimento, você escolhe o equipamento daqui e define a % de margem na hora.
          </p>
        </div>

        {logCat.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 space-y-1 max-h-48 overflow-y-auto">
            {logCat.map((l, i) => (
              <div key={i} className={`text-xs flex items-center gap-2 ${l.tipo === "ok" ? "text-green-700" : "text-red-600"}`}>
                <span>{l.tipo === "ok" ? "✓" : "✗"}</span>
                <span>{l.msg}</span>
              </div>
            ))}
          </div>
        )}

        {concluidoCat ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <p className="text-sm font-semibold text-green-800">✓ Catálogo Uniar populado!</p>
            <p className="text-xs text-green-700 mt-1">
              Acesse <strong>Catálogo</strong> no menu para conferir os produtos e, quando a tabela Uniar atualizar, use essa tela para re-popular.
            </p>
          </div>
        ) : (
          <button onClick={handleSeedCatalogo} disabled={rodandoCat}
            className="w-full bg-[#6b3fa0] text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 active:scale-95 transition-all">
            {rodandoCat
              ? `Importando... (${logCat.length}/${CATALOGO_UNIAR.length})`
              : `Importar Catálogo Uniar (${CATALOGO_UNIAR.length} produtos)`}
          </button>
        )}
        {/* ── Seção Manutenção Corretiva ── */}
        <div className="mt-8 mb-3">
          <p className="text-sm font-bold text-gray-700">Modelos de Manutenção Corretiva</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Adiciona 2 modelos com <code>categoria: "corretiva"</code> — ao gerar o PDF, as condições de corretiva são aplicadas automaticamente.
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4">
          <div className="space-y-1">
            {SERVICOS_CORRETIVA.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-4 h-4 rounded-full bg-orange-50 text-orange-400 text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                {s.nome}
              </div>
            ))}
          </div>
        </div>

        {logCor.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 space-y-1 max-h-40 overflow-y-auto">
            {logCor.map((l, i) => (
              <div key={i} className={`text-xs flex items-center gap-2 ${l.tipo === "ok" ? "text-green-700" : "text-red-600"}`}>
                <span>{l.tipo === "ok" ? "✓" : "✗"}</span>
                <span>{l.msg}</span>
              </div>
            ))}
          </div>
        )}

        {concluidoCor ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center mb-6">
            <p className="text-sm font-semibold text-green-800">✓ Modelos de corretiva adicionados!</p>
            <p className="text-xs text-green-700 mt-1">
              Ao selecionar esses serviços em um orçamento, o PDF usará as condições de manutenção corretiva automaticamente.
            </p>
          </div>
        ) : (
          <button onClick={handleSeedCorretiva} disabled={rodandoCor}
            className="w-full bg-[#c2410c] text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 active:scale-95 transition-all mb-6">
            {rodandoCor
              ? `Criando... (${logCor.length}/${SERVICOS_CORRETIVA.length})`
              : "Adicionar Modelos de Corretiva"}
          </button>
        )}
      </main>
    </div>
  );
}