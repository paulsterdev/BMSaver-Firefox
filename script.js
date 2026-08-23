
const nameField = document.getElementById("nameField");
const urlField = document.getElementById("urlField");
const folderSelector = document.getElementById("folder")
const saveButton = document.getElementById("saveButton");
const clearButton = document.getElementById("clearButton");
const message = document.getElementById("message");
const newFolderButton = document.getElementById("newFolderButton");
const newFolderControls = document.getElementById("newFolderControls");
const newFolderName = document.getElementById("newFolderField");
const newFolderParentSelector = document.getElementById("parentFolder");
const submitNewFolderButton = document.getElementById("submitFolder");
const CancelNewFolderButton = document.getElementById("cancelFolder");

var folderNames = [];
var folderIDs = [];
var folderID = "";
var folderName = ``;
var selectItemsHTML = ``;

// General error handling function
function handleError(error)
{
    console.error(`Error occured: ${error}`);
}

// Adds folder names and folder IDs into array for folder selector menu poopulation
function updateFolders(bookmarkItem) 
{
    if (!(bookmarkItem.url) && (bookmarkItem.title))
    {
        folderID = bookmarkItem.id.toString();
        folderIDs.push(folderID);
        let folderName = "";
        let parentFolderFound = false;
        let folderIDsIndex = 0;

        for (let index = 0; index < folderIDs.length; index++)
        {
            if (folderIDs[index] == bookmarkItem.parentId)
            {
                parentFolderFound = true;
                folderIDsIndex = index;
                break;
            }
        }
        if (parentFolderFound)
        {
            folderName = (folderNames[folderIDsIndex] + "/" + (bookmarkItem.title.toString().toUpperCase()));
        }
        else
        {
            folderName = bookmarkItem.title.toString().toUpperCase();
        }
        folderNames.push(folderName);

        
    }
    if (bookmarkItem.children)
    {
        for (const child of bookmarkItem.children) 
        {
            updateFolders(child);
        }
    }
    
    }  

// Passes bookmark tree into updateFolders
function getItems(bookmarkItems) 
{
    selectItemsHTML = ``;
    folderNames = [];
    folderIDs = [];
    updateFolders(bookmarkItems[0]);
}

// Populates folder selector menu using the data collected by updateFolders
function writeHTML()
{
    for (var i = 0; i < folderNames.length; i++)
    {
    selectItemsHTML += 
    `<option value="${folderIDs[i]}">${folderNames[i]}</option>
    `
    }
    folderSelector.innerHTML = 
`    
        ${selectItemsHTML}
`;
}

// Prints error, success messages to the popup
function displayMessage(messageText, messageColor)
{
    clearMessage();
    message.style.color = messageColor;
    if (!(message.innerHTML.includes(messageText)))
    {
        message.innerHTML += `<p>${messageText}</p>`;
    }
    
}

// General error catching function for uncaught errors
function catchError(error)
{
    if (error == "Error: Invalid URL.")
    {
        console.log(error)
        urlField.style.border = "1px solid red";
        displayMessage("INVALID URL FORMAT.", "red");
    }
    else
    {
        console.log(error);
    }
}

// Clears currently displayed messages from popup
function clearMessage()
{
    message.innerHTML = ``;
    nameField.style.border = "1px solid black";
    urlField.style.border = "1px solid black";
}

// Hides folder controls and clears active messages when folder creation is canceled
const cancelNewFolderButtonAction = () =>
{
    clearMessage();
    hideFolderControls();
    controlFields();

}

// Creates folder and recalls function sequence
function addFolder(folderName, parentFolder)
{
    clearMessage();
    let newFolder = browser.bookmarks.create({'parentId':parentFolder,'title': folderName});
    newFolder.catch(error => catchError(error));
    displayMessage(`SAVED "${folderName.toUpperCase()}".`,"#290000");
    hideFolderControls();
    loadBMObject();
}

// Checks folder data submission data for errors, then calls addFolder if everything's good
const submitNewFolderButtonAction = () =>
{
        submitNewFolderButton.removeEventListener("click", submitNewFolderButtonAction);
            if(newFolderName.value == "")
            {
                newFolderName.style.border = "1px solid red"
                displayMessage("FOLDER NAME MUST NOT BE EMPTY.", "red");
                newFolderButtonClickAction();
            }
            else
            {
                var folderName = newFolderName.value;
                var parentFolder = newFolderParentSelector.value;
                addFolder(folderName, parentFolder);
            }
}

// Unhides folder creation controls
function unhideFolderControls()
{
    newFolderControls.style.display = "";
}

// Hides folder creation controls
function hideFolderControls()
{
    newFolderControls.style.display = "none";
}

// Unhides folder controls, populates parent folder selector menu
function newFolderButtonClickAction() 
{
        newFolderButton.removeEventListener("click", newFolderButtonClickAction);
        unhideFolderControls();
        newFolderParentSelector.innerHTML = 
        `
            ${selectItemsHTML};
        `
        submitNewFolderButton.addEventListener("click", submitNewFolderButtonAction);
        CancelNewFolderButton.addEventListener("click", cancelNewFolderButtonAction);  
}

// Adds a new bookmark
function addBookmark(parentId, title, url)
{
    clearMessage();
    console.log(parentId);
    let newBookmark = browser.bookmarks.create({'parentId': parentId,'title': title,'url': url,});
    newBookmark.catch(error => catchError(error));
    displayMessage(`SAVED "${title.toUpperCase()}".`,"#290000");
}

// Looks for errors in submitted bookmark info, then calls addBookmark if everything's good
const saveButtonAction = () =>
{
    saveButton.removeEventListener("click", saveButtonAction);
    var title = nameField.value;
    var url = urlField.value;
    var parentId = folderSelector.value;
    if(!title || !url)
    {
        if (!title && !url)
        {
            nameField.style.border = "1px solid red";
            urlField.style.border = "1px solid red";
            displayMessage("NAME AND URL CANNOT BE BLANK.", "red")
        }
        else if(!title)
        {
            nameField.style.border = "1px solid red";
            displayMessage("NAME CANNOT BE BLANK.", "red");
        }
        else if(!url)
        {
            displayMessage("URL CANNOT BE BLANK.", "red");
            urlField.style.border = "1px solid red";
        }

    }
    else if ((!(url.substr(url.length - 1).match(/[a-z]/i))) && ((url.substr(url.length - 1) != '/')))
    {
        displayMessage("URL FORMAT INVALID.", "red");
        urlField.style.border = "1px solid red";
    }
    else
    {
        if (!(url.includes("https://")) && !(url.includes("http://")))
        {
            let preFormattedUrl = urlField.value;
            urlField.value = "http://" + preFormattedUrl;
            url = urlField.value;
        }
        addBookmark(parentId, title, url);
    }
    controlFields();
}

// Clears message(s) and populated bookmark fields
const clearButtonAction = () =>
{
        clearButton.removeEventListener("click", clearButtonAction);
        clearMessage();
        nameField.value = "";
        urlField.value = "";
        folderSelector.selectedIndex = 0;
        controlFields();
}

// Main "hub" controlling what each button does
function controlFields()
{
    newFolderButton.addEventListener("click", newFolderButtonClickAction);
    saveButton.addEventListener("click", saveButtonAction);
    clearButton.addEventListener("click", clearButtonAction);
    
}

// Starts up the bookmark tree parsing and dropdown menu population systems
function loadBMObject(){
    let BMObject = browser.bookmarks.getTree();
    BMObject.then(getItems, handleError)
            .then(writeHTML,handleError)
            .then(controlFields, handleError);
}


loadBMObject();




