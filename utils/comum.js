
function gerarTimestamp(dt, tipo){
  
    var dia = dt.getDate();
    var mes = dt.getMonth()+1;
    var ano = dt.getFullYear();
    var hora = dt.getHours();
    var min = dt.getMinutes();
    var seg = dt.getSeconds();
  
    if (dia < 10){
      dia = "0"+dia;
    } 
    
    if (mes < 10){
      mes = "0"+mes;
    } 
    
    if(hora < 10){
      hora = "0"+hora;
    }
    
    if (min < 10){
      min = "0"+min;
    }
    
    if (seg < 10){
      seg = "0"+seg;
    }
  
    if(tipo == "DH"){
      var timestamp = dia + "/" + mes + "/" + ano  + " " + hora + ":" + min  + ":" + seg;
    } else if(tipo == "D"){
      var timestamp = dia + "/" + mes + "/" + ano;
    } else if(tipo == "EXT"){
      var ls = [];
      ls["01"] = "janeiro";
      ls["02"] = "fevereiro";
      ls["03"] = "março";
      ls["04"] = "abril";
      ls["05"] = "maio";
      ls["06"] = "junho";
      ls["07"] = "julho";
      ls["08"] = "agosto";
      ls["09"] = "setembro";
      ls["10"] = "outubro";
      ls["11"] = "novembro";
      ls["12"] = "dezembro";
      var timestamp = dia + " de " + ls[mes] + " de " + ano;
    }
}

function Left(str, n){
	if (n <= 0)
	    return "";
	else if (n > String(str).length)
	    return str;
	else
	    return String(str).substring(0,n);
}

function Right(str, n){
    if (n <= 0)
       return "";
    else if (n > String(str).length)
       return str;
    else {
       var iLen = String(str).length;
       return String(str).substring(iLen, iLen - n);
    }
}

function dateToBD (dt) {
    let dia = dt.getDate();
    let mes = dt.getMonth()+1;
    let ano = dt.getFullYear();

    if (dia < 10){
      dia = '0' + dia;
    } 
    
    if (mes < 10){
      mes = '0' + mes;
    } 

    return `${ano}-${mes}-${dia}`;
}

function dateToView (dt) {
  if(dt == null) {
    return '-';
  } else {
    let date = new Date(dt);
    let dia = date.getDate();
    let mes = date.getMonth()+1;
    let ano = date.getFullYear();
  
      if (dia < 10){
        dia = '0' + dia;
      } 
      
      if (mes < 10){
        mes = '0' + mes;
      } 
  
      return `${dia}/${mes}/${ano}`;
  }
}

const appStruct = {
  route: 'Home',
  link: '/home',
  pageName: 'Home',
  members: [
      {route: 'operações', link: '/operacoes', pageName: 'operações', members: [
          {route: 'itens', link: '/operacoes/itens', pageName: 'itens', members: [
              'consultar estoque'
          ]},
          {route: 'pedidos', link: '/operacoes/pedidos', pageName: 'pedidos', members: [
              'consultar pedidos',
              'meus pedidos',
              'cadastrar pedido'
          ]}
      ]},
      {route: 'administração', link: '/admin', pageName: 'administração', members: [
          {route: 'itens', link: '/admin/itens', pageName: 'estoque', members: [
              'editar item',
              'cadastrar item',
              'gerenciar estoque'
          ]},
          {route: 'pedidos', link: '/admin/pedidos', pageName: 'gerenciar Pedidos', members: [
              'atendimento',
              'atender pedido'
          ]},
          {route: 'usuários', link: '/admin/usuarios', pageName: 'usuários', members: [
              'editar usuário'
          ]}
      ]}
  ]
}

const AppStructLevel2 = () => {
  let level2 = appStruct.members.map((member) => {
      return {route: member.route, link: member.link, pageName: member.pageName, members: member.members}
  });
  return level2;
}

const AppStructLevel3 = () => {
  let l2 = AppStructLevel2();
  let level3 = l2.reduce((accum, { route, members }) => {
    let parent = route;
    members.forEach((m) => {
      accum.push({ route: m.route, link: m.link, pageName: m.pageName, parent: parent, members: m.members })
    })
    return accum
  }, []);
  
  return level3
}

function setBreadcrumbs(tituloPagina) {
//    let tituloPagina = 'Editar usuário'
  let str = tituloPagina.toLowerCase()
  let pm = priMaiuscula;
  let breadcrumb = [];

  let level2 = AppStructLevel2()
  let level3 = AppStructLevel3()
  let level4 = []
  let level2Pages = [], level3Pages = [], level4Pages = []
  
  level2.forEach((item) => {
      level2Pages.push(item.pageName)
  })

  level3.forEach((item) => {
      level3Pages.push(item.pageName)
      item.members.forEach((m) => {
          level4.push({pageName: m, parent: item.pageName})
          level4Pages.push(m);
      })
  })

  if(level2Pages.includes(str)) {
      let i = level2Pages.indexOf(str)
      breadcrumb = [
          {pageName: 'Home', link: '/home'},
          {pageName: pm(level2[i].pageName), link: ''}
      ]
  } else if(level3Pages.includes(str)) {
      let j = level3Pages.indexOf(str)
      let i = level2Pages.indexOf(level3[j].parent);
      breadcrumb = [
          {pageName: 'Home', link: '/home'},
          {pageName: pm(level2[i].route), link: level2[i].link},
          {pageName: pm(level3[j].pageName), link: ''}
      ]
  } else if(level4Pages.includes(str)) {
      let k = level4Pages.indexOf(str)
      let j = level3Pages.indexOf(level4[k].parent)
      let i = level2Pages.indexOf(level3[j].parent);
      breadcrumb = [
          {pageName: 'Home', link: '/home'},
          {pageName: pm(level2[i].route), link: level2[i].link},
          {pageName: pm(level3[j].route), link: level3[j].link},
          {pageName: pm(level4[k].pageName), link: ''}
      ]
  }

  return breadcrumb;
}

function priMaiuscula(palavra) {
  let pLetra = Left(palavra, 1);
  let str = palavra.substring(1, palavra.length);
  return pLetra.toUpperCase() + str;
}

module.exports = {Left, Right, dateToBD, dateToView, setBreadcrumbs};