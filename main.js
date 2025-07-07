// VARIABLES GLOBALES
let equipoActual = 0;
let opciones = [
  { label: 'Pregunta', color: '#ff66d9', tipo: 'pregunta' },
  { label: 'Bueno', color: '#66ff66', tipo: 'bueno' },
  { label: 'Sí y No', color: '#6666ff', tipo: 'siono' },
  { label: '¿Quién?', color: '#ffff66', tipo: 'quien' },
  { label: 'Pregunta', color: '#ff66d9', tipo: 'pregunta' },
  { label: 'Malo', color: '#ff4d4d', tipo: 'malo' },
  { label: 'Sí y NO', color: '#6666ff', tipo: 'siono' },
  { label: '¿Quién?', color: '#ffff66', tipo: 'quien' }
];
let preguntas = { pregunta: [], quien: [], siono: [] };
let usadas = { pregunta: [], quien: [], siono: [] };
let rotacion = 0;
let ruleta = document.getElementById('ruleta');
let ctx = ruleta.getContext('2d');

let cuentaRegresiva;

// EVENTOS
window.addEventListener('DOMContentLoaded', () => {
  let equipos = document.querySelectorAll('.equipo');

  document.querySelectorAll('.equipo').forEach(e => {
    e.addEventListener('click', () => {
      equipoActual = parseInt(e.dataset.equipo);
      document.getElementById('pantalla-inicial').classList.add('oculto');
      document.getElementById('ruleta-container').classList.remove('oculto');
      document.getElementById('titulo-equipo').textContent = `Turno del Grupo ${equipoActual + 1}`;
    });
  });

  document.getElementById('btn-girar').addEventListener('click', girarRuleta);
  document.getElementById('btn-cerrar').addEventListener('click', cerrarModal);
  document.getElementById('btn-dar-pregunta').addEventListener('click', darPregunta);
  document.getElementById('btn-correcto').addEventListener('click', () => correcto(equipos));
  document.getElementById('btn-incorrecto').addEventListener('click', incorrecto);

  fetch('data.json').then(res => res.json()).then(data => preguntas = data);
  dibujarRuleta();
});

function dibujarRuleta() {
  let angulo = (2 * Math.PI) / opciones.length;
  for (let i = 0; i < opciones.length; i++) {
    let inicio = rotacion + i * angulo;
    let fin = inicio + angulo;
    ctx.beginPath();
    ctx.moveTo(250, 250);
    ctx.arc(250, 250, 250, inicio, fin);
    ctx.fillStyle = opciones[i].color;
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.save();
    ctx.translate(250, 250);
    ctx.rotate(inicio + angulo / 2);
    ctx.fillStyle = 'black';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(opciones[i].label, 130, 10);
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(250, 250, 250, 0, 2 * Math.PI);
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(250, 250, 20, 0, 2 * Math.PI);
  ctx.fillStyle = 'white';
  ctx.fill();
}

function girarRuleta() {
  let giro = Math.random() * 360 + 720;
  const inicio = performance.now();
  const duracion = 4000;

  function animar(tiempo) {
    let progreso = Math.min((tiempo - inicio) / duracion, 1);
    let easeOut = 1 - Math.pow(1 - progreso, 3);
    rotacion = (giro * easeOut * Math.PI) / 180;
    ctx.clearRect(0, 0, 500, 500);
    dibujarRuleta();
    if (progreso < 1) requestAnimationFrame(animar);
    else mostrarResultado();
  }
  requestAnimationFrame(animar);
}

function mostrarResultado() {
  let angulo = (2 * Math.PI) / opciones.length;
  let normal = rotacion % (2 * Math.PI);
  let indice = Math.floor(((2 * Math.PI - normal) % (2 * Math.PI)) / angulo);
  let opcion = opciones[indice];
  document.getElementById('resultado-opcion').textContent = opcion.label === 'Bueno' || opcion.label === 'Malo' ? 'Tomar una tarjeta' : opcion.label;
  document.getElementById('modal').classList.remove('oculto');
  document.getElementById('opciones-iniciales').classList.remove('oculto');
  document.getElementById('pregunta-contenido').classList.add('oculto');
  document.getElementById('modal').dataset.tipo = opcion.tipo;
}

function cerrarModal() {
  document.getElementById('modal').classList.add('oculto');
}

function darPregunta() {
  const tipo = document.getElementById('modal').dataset.tipo;
  let lista = preguntas[tipo].filter(p => !usadas[tipo].includes(p));
  if (lista.length === 0) return alert('Ya no quedan preguntas de esta categoría');
  let elegida = lista[Math.floor(Math.random() * lista.length)];
  document.getElementById('texto-pregunta').textContent = elegida;
  document.getElementById('pregunta-contenido').classList.remove('oculto');
  document.getElementById('opciones-iniciales').classList.add('oculto');
  iniciarTemporizador();
}

function iniciarTemporizador() {
  let tiempo = 20;
  let timer = document.getElementById('timer');
  timer.textContent = tiempo;
  timer.style.color = '#333';
  clearInterval(cuentaRegresiva);
  cuentaRegresiva = setInterval(() => {
    tiempo--;
    timer.textContent = tiempo;
    if (tiempo <= 0) {
      clearInterval(cuentaRegresiva);
      timer.style.color = 'red';
      document.getElementById('sonido-alarma').play();
    }
  }, 1000);
}

function correcto(equipos) {
  let tipo = document.getElementById('modal').dataset.tipo;
  let texto = document.getElementById('texto-pregunta').textContent;
  usadas[tipo].push(texto);
  document.getElementById('sonido-correcto').play();
  let span = equipos[equipoActual].querySelector('.puntos');
  span.textContent = parseInt(span.textContent) + 1;
  cerrarModal();
}

function incorrecto() {
  document.getElementById('sonido-incorrecto').play();
  cerrarModal();
}
