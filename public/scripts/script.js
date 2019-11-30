let credentials = [];
let masterPass = null;
let userToken = null;

$(() => {
    if (getCookie("usertoken") == '')
    {
        login();
    }
    else
    {
        userToken = getCookie("usertoken");
        createMenu();
        loadCreds();
    }    
});

createMenu = () =>
{
    var createCredmenuitem = $('<li>');
    var link = $('<a>' , {
        text: 'Create new credential',
        title: 'Create new credential',
        href: '#'
    });

    link.click(function()
    {
        // TODO uusi credentiaali
    });

    createCredmenuitem.append(link);
    $('#navElements').append(createCredmenuitem);

    var signoutmenuitem = $('<li>');
    link = $('<a>', {
        text: 'Log out',
        title: 'Log out',
        href: '?'
    });


    link.click(function(){
        document.cookie = "usertoken=; path=/;";
        masterPass = null;
    });

    signoutmenuitem.append(link);
    $('#navElements').append(signoutmenuitem);
}

login = () =>
{
    $('#appContent').load("public/login.html");
}

loadCreds = () =>
{
    console.log("USERTOKEN:" + userToken);
    Credential.fetchAll(userToken, (data) => {
        let returnArray = [];
        if (data.data != null){
            data.data.forEach(cred => {
                let credential = new Credential();
                credential.setFromData(cred)
                returnArray.push(credential);
                credentials.push(credential);
            });
            $('#detailsPlaceholder').load("public/detailsdialog.html");
            createCredentialOverview(returnArray);
        } else if(data.message == 'No Credentials Found') {
            $('#appContent')
                .append(
                    $('<h4>')
                        .text('It seems that you don\'t have any credentials yet. Please start by adding a one!')
                );
        }
    }); 
};

createCredentialOverview = (data) => {
    let element =  $('<div>').addClass('overview');
    for (let i = 0; i < data.length; i++) {
        element.append(createCredentialOverviewElement(data[i]));
    }
    $('#appContent').append(element);
}

createCredentialOverviewElement = (cred) => {
    let element =  $('<div>').addClass('overviewElement');
    element.append($('<h4>').text(cred.credentialDescription));
    element.append($('<p>').addClass('usernameLabel').text('-[ ' + cred.username + ' ]-'));
    
    element.click(function()
    {
        if (masterPass == null || masterPass == "")
        {
            masterPass = prompt("Please enter your master password", "");

            if (masterPass == null || masterPass == "") {
                return;
            } 
        }

        var key = AES.generateKey(cred.salt, masterPass);
        var purettu = AES.decrypt(key, cred.iv, cred.password);

        if (purettu == "" || purettu == null)
        {
            alert("Wrong master password?");
            masterPass = null;
            return;
        }

        $("#detailsDialog").modal();
        
        $('#detailsDialogUsernameInput').val(cred.username);
        $('#detailsDialogDescriptionInput').val(cred.credentialDescription);

        

        $('#detailsDialogPasswordInput').val(purettu);
        // $('#detailsDialogPasswordInput').val(cred.password);

        console.log("PASSWORD:" + purettu);
        console.log("SALT:" + cred.salt);
        console.log("IV:" + cred.iv);
        
    });

    return element;
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  
  