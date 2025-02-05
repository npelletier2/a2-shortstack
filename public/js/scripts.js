// Add some Javascript code here, to run on the front end.

const changeTheme = function(){
    document.body.classList.toggle("dark")
}

const submit = function( e ) {
    // prevent default form action from being carried out
    e.preventDefault()

    const format = document.getElementById("input-type").value
    let input
    switch(format){
      case "hex":
        input = document.getElementById("hex-input").value
        break
      case "rgb":
        input = [parseInt(document.getElementById("r").value),
                parseInt(document.getElementById("g").value),
                parseInt(document.getElementById("b").value)]
      break
      case "hsl":
        input = [parseInt(document.getElementById("h").value),
                parseInt(document.getElementById("s").value),
                parseInt(document.getElementById("l").value)]
        break
    }

    const json = { input, format },
          body = JSON.stringify( json )

    fetch( '/submit', {
      method:'POST',
      body 
    })
    .then(response => response.json())
    .then(function(json){
      try{//remove the error message if it is there
        document.getElementById("error").remove()
      }catch(e){}

      if(JSON.stringify(json) === "{}"){//bad input
        const form = document.getElementById("entry-fields")
        const child = document.createElement("p")
        child.setAttribute("id", "error")
        child.innerText = "Please enter a valid 3- or 6-digit hex value, starting with #"
        form.prepend(child)
      }else{
        const table = document.querySelector("tbody")
        
        const child = document.createElement("tr")
        child.setAttribute("id", `color-${json.num}`)

        child.innerHTML = createRow(json)
        table.appendChild(child)
      }
    })

    return false
  }

  const edit = function(num){
    const cells = document.getElementById(`color-${num}`).childNodes

    document.getElementById(`edit-${num}`).disabled = true
    
    cells[2].innerHTML = `<input id="hex-edit" type="text" value="${cells[2].innerText}">
                          <button id="hex-edit-submit" onclick="submitEdit(${num},'hex')">Submit Hex</button>`

    let rgb = cells[4].innerText.split(",")
    cells[4].innerHTML = `<input id="r-edit" type="number" value="${rgb[0]}" min="0" max="255">
                          <input id="g-edit" type="number" value="${rgb[1]}" min="0" max="255">
                          <input id="b-edit" type="number" value="${rgb[2]}" min="0" max="255">
                          <button id="rgb-edit-submit" onclick="submitEdit(${num},'rgb')">Submit RGB</button>`
    
    let hsl = cells[6].innerText.split(",")
    cells[6].innerHTML = `<input id="h-edit" type="number" value="${hsl[0]}" min="0" max="360">
                          <input id="s-edit" type="number" value="${hsl[1]}" min="0" max="100">
                          <input id="l-edit" type="number" value="${hsl[2]}" min="0" max="100">
                          <button id="hsl-edit-submit" onclick="submitEdit(${num},'hsl')">Submit HSL</button>`
  }

  const submitEdit = function(num, format){
    const cells = document.getElementById(`color-${num}`).childNodes
    let change = ""
    
    switch(format){
      case "hex":
        change = cells[2].childNodes[0].value
        break
      case "rgb":
        change = [parseInt(cells[4].childNodes[0].value),
                  parseInt(cells[4].childNodes[2].value),
                  parseInt(cells[4].childNodes[4].value)]
        break
      case "hsl":
        change = [parseInt(cells[6].childNodes[0].value),
                  parseInt(cells[6].childNodes[2].value),
                  parseInt(cells[6].childNodes[4].value)]
        break
    }

    const body = JSON.stringify({"input": "edit", format, change, "num": num})
    
    fetch( '/submit', {
      method:'POST',
      body
    })
    .then(response => response.json())
    .then(function(json){
      document.getElementById(`color-${num}`).innerHTML = createRow(json)
    })

    document.getElementById(`edit-${num}`).disabled = false
  }

  const del = function(num){
    const body = JSON.stringify({"input": "del", "num": num})
    
    fetch( '/submit', {
      method:'POST',
      body
    })
    .then(response => response.json())
    .then(function(json){
      document.getElementById(`color-${json.num}`).remove()
    })
  }

  /*
  * Creates an HTML table row from the given JSON object.
  * The object must take the form {hex: <data>, rgb: <data>, hsl: <data>}
  */
  function createRow(jsonobj){
    return `<td style="background-color: ${jsonobj.hex}" class = "color-cell"></td>
            <td>${jsonobj.hex}</td> <td>${jsonobj.rgb}</td> <td>${jsonobj.hsl}</td>
            <td class="button"><button id="edit-${jsonobj.num}" onclick="edit(${jsonobj.num})">Edit</button></td>
            <td class="button"><button id="delete-${jsonobj.num}" onclick="del(${jsonobj.num})">Delete</button></td>`
  }

  /*
  * Called when the input type is changed (hex, rgb, or hsl)
  */
  function inputTypeChange(selectObj){
    const format = selectObj.value
    const fieldDiv = document.getElementById("entry-fields")
    fieldDiv.textContent = ""
    switch(format){
      case "hex":
        fieldDiv.innerHTML = `<input id="hex-input" type="text" placeholder="#BEEEEF">`
        break
      case "rgb":
        fieldDiv.innerHTML = `<input id="r" type="number" placeholder="Red (0-255)" min="0" max="255">
                              <input id="g" type="number" placeholder="Blue (0-255)" min="0" max="255">
                              <input id="b" type="number" placeholder="Green (0-255)" min="0" max="255">`
        break
      case "hsl":
        fieldDiv.innerHTML = `<input id="h" type="number" placeholder="Hue (0-360)" min="0" max="360">
                              <input id="s" type="number" placeholder="Saturation (0-100)" min="0" max="100">
                              <input id="l" type="number" placeholder="Lightness (0-100)" min="0" max="100">`
        break
    }
  }

  window.onload = function() {
    const button = document.getElementById("submit")
    button.onclick = submit

    inputTypeChange(document.getElementById("input-type"))

    fetch( '/submit', {
      method:'POST',
      body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(function(json){
      const table = document.querySelector("tbody")
      json.forEach(ele => {
        const child = document.createElement("tr")
        child.setAttribute("id", `color-${ele.num}`)
        child.innerHTML = createRow(ele)
        table.appendChild(child)
      })
    })
  }