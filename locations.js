(() => {
  // Coordenadas dos locais cadastrados na VM em 30/10/2026; não são a posição interna da loja.
  const units = [
    {name:'Reserva do Engenho',lat:-22.73338,lng:-47.672548},
    {name:'Monte Alegre',lat:-22.703273,lng:-47.592006},
    {name:'Praça das Araucárias',lat:-22.711572,lng:-47.640054},
    {name:'Aeroclube de Piracicaba',lat:-22.703351,lng:-47.591917},
    {name:'Damha 1',lat:-22.699609,lng:-47.675638},
    {name:'Jardins',lat:-22.740049,lng:-47.623703},
    {name:'Terras de Piracicaba IV (Terras 4)',lat:-22.725312,lng:-47.677563},
    {name:'Provence',lat:-22.74841,lng:-47.644915}
  ];
  const list = document.getElementById('location-list');
  const mapNode = document.getElementById('locations-map');
  if (!list || !mapNode) return;
  const buttons = units.map((unit, index) => {
    const button = document.createElement('button'); button.type='button'; button.className='location-button';
    const number=document.createElement('span'); number.className='unit-number'; number.textContent=String(index+1).padStart(2,'0');
    const name=document.createElement('strong'); name.textContent=unit.name;
    const arrow=document.createElement('span'); arrow.setAttribute('aria-hidden','true'); arrow.textContent='↗';
    button.append(number,name,arrow); list.append(button); return button;
  });
  if (!window.L) { mapNode.textContent='Mapa temporariamente indisponível. Os nomes das unidades continuam disponíveis ao lado.'; return; }
  const map=L.map(mapNode,{scrollWheelZoom:false,zoomControl:false}).setView([-22.725,-47.65],12);
  L.control.zoom({position:'bottomright'}).addTo(map);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap contributors'}).addTo(map);
  const markers=units.map((unit,index)=>{
    const icon=L.divIcon({className:'nm-map-icon',html:`<span>${String(index+1).padStart(2,'0')}</span>`,iconSize:[34,34],iconAnchor:[17,17]});
    const marker=L.marker([unit.lat,unit.lng],{icon,title:unit.name}).addTo(map);
    const popup=document.createElement('div'); popup.className='nm-popup';
    const title=document.createElement('strong');title.textContent=unit.name;
    const note=document.createElement('span');note.textContent='Local cadastrado na VM · acesso reservado';
    popup.append(title,note);marker.bindPopup(popup);
    marker.on('click',()=>select(index,false));
    buttons[index].addEventListener('click',()=>select(index,true));
    return marker;
  });
  map.fitBounds(L.latLngBounds(units.map(unit=>[unit.lat,unit.lng])),{padding:[32,32],maxZoom:12});
  function select(index,focusMap) {
    buttons.forEach((button,i)=>button.classList.toggle('selected',i===index));
    markers[index].setZIndexOffset(1000); markers[index].openPopup();
    if(focusMap) map.flyTo([units[index].lat,units[index].lng],Math.max(map.getZoom(),14),{duration:.65});
  }
})();
