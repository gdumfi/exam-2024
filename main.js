let url = "http://exam-2023-1-api.std-900.ist.mospolytech.ru/api";
let key = "5e67617a-6897-42aa-ae86-8747e5a2af44";
let countOfPages; //Количество страниц
let globalListRoutes; //Список маршрутов
let globalListGuides; //Список гидов по маршруту
let SortListRoutes; //Отсортированные маршруты
let selectRoute; //Выбранный маршрут
let selectGuide; //Выбранный гид
let globalListAttractions = []; //Список достопримечательностей
let experienceFrom, experienceTo; //Опыт работы
let price; //Цена

//Показ уведомлений из Bootstrap5
function showAlert(error, color) 
{
    let alerts = document.querySelector(".alerts");//Получение элемента для отображения предупреждений
    let alert = document.createElement("div");//Создание элемента предупреждения
    alert.classList.add("alert", "alert-dismissible", color);
    alert.append(error);
    let btn = document.createElement("button");
    btn.setAttribute("type", "button");
    btn.classList.add("btn-close");
    btn.setAttribute("data-bs-dismiss", "alert");
    btn.setAttribute("aria-label", "Close");
    alert.append(btn);//Добавление кнопки в предупреждение
    alerts.append(alert);
    setTimeout(() => alert.remove(), 4000);//Автоматическое закрытие через 4 секунды
}

//Загрузка маршрутов с сервера 
async function downloadRoutesFromServer() 
{
    let thisUrl = new URL(url + "/routes");//Формирование URL-адреса запроса
    thisUrl.searchParams.append("api_key", key);

    try //Отправка запроса и обработка ответа
    {
        let response = await fetch(thisUrl, { method: "GET" });//Отправляет GET-запрос к сформированному URL-адресу и ожидает ответа от сервера.
        let routes = await response.json();
        globalListRoutes = routes;//Сохранение и возвращение данных
        return routes;
    } 

    catch (error) //Обработка ошибок
    {
        showAlert(error.message, "alert-danger");
    }
}

//Добавление элементов в HTML для loadRoutes 
function addNewRoute(number, Eleminfo) 
{
    let excursionForClone = document.querySelector(".exaple-excursion");// Получает элемент на странице с классом exaple-excursion который используется в качестве шаблона для создания строки маршрута
    let exapleExcursion = excursionForClone.cloneNode(true);
    exapleExcursion.innerHTML = "";//Очистка и настройка копии
    exapleExcursion.classList = "route";
    exapleExcursion.innerHTML += "<td scope=\"row\">" + number + "</td>";//Добавление порядкового номера и названия маршрута
    exapleExcursion.innerHTML += "<td>" + Eleminfo.name + "</td>";

    if (Eleminfo.description.length <= 100) //Добавление описания маршрута 
    {
        exapleExcursion.innerHTML += "<td>" + Eleminfo.description + "</td>";
    } 
    else 
    {
        exapleExcursion.innerHTML += "<td>" + Eleminfo.description.substring(0, 100) + "<br><button type=\"button\" class=\"btn btn-link p-0 m-0 " + "description-more-detals\" value=\"" + Eleminfo.description + "\">Подробнее</button>" + "</td>";
    }

    if (Eleminfo.mainObject.length <= 100) //Добавление основного объекта маршрута
    {
        exapleExcursion.innerHTML += "<td>" + Eleminfo.mainObject + "</td>";
    } 
    else 
    {
        exapleExcursion.innerHTML += "<td>" + Eleminfo.mainObject.substring(0, 100) + "<br><button type=\"button\" class=\"btn btn-link "+ "p-0 m-0 mainObject-more-detals\" value=\""+ Eleminfo.mainObject + "\">Подробнее</button>" + "</td>";
    }

    let check_input = "<td><input class=\"form-check-input radio-route\" " + "type=\"radio\" name=\"radio-route\" value=\""  + Eleminfo.id + "\" data-id=\"" + Eleminfo.id + "\"></td>";
    exapleExcursion.innerHTML += check_input;//Добавление радиокнопки для выбора маршрута
    let listExcursion = document.querySelector(".list-excursion");//Добавление строки в список маршрутов
    listExcursion.append(exapleExcursion);
}

//Заполнение таблицы маршрутов
function loadRoutes(numberPage, routes) 
{
    if (routes.length % 10 == 0) //Расчет количества страниц
    {
        countOfPages = routes.length / 10;
    }
    else 
    {
        countOfPages = Math.floor(routes.length / 10) + 1;
    }
    loadNumberPages(numberPage, countOfPages);
    let allRoute = document.querySelectorAll(".route");//Очистка списка маршрутов

    for (let i = 0; i < allRoute.length; i++) 
    {
        let elem = allRoute[i];
        elem.parentNode.removeChild(elem);
    }

    for (let i = (numberPage * 10) - 10; i < numberPage * 10; i++) //Загрузка маршрутов для текущей страницы
    {
        if (routes[i]) 
        {
            addNewRoute(i + 1, routes[i]);
        }
    }
    HideMore();
    let radioList = document.querySelectorAll('.radio-route');//Назначение обработчиков для радиокнопок

    for (let i = 0; i < radioList.length; i++) 
    {
        elem = radioList[i];
        elem.onchange = radioRouteChange;
    }
    let thisSelectRoute = document.querySelector("[data-id='" + selectRoute + "']");//Восстановление выбранного маршрута

    if (selectRoute && thisSelectRoute) 
    {
        thisSelectRoute.parentNode.parentNode.classList.add("select-route");
        thisSelectRoute.setAttribute("checked", "true");
    }
}

async function loadRoutesStart(numberPage) 
{
    let routes = await downloadRoutesFromServer();//Загрузка маршрутов с сервера
    temporaryListRoutes = routes;

    for (let i = 0; i < routes.length; i++)//Добавление достопримечательностей в список
    {
        addAttractionsToList(routes[i].mainObject);
    }     
    loadRoutes(numberPage, routes);//Загрузка маршрутов на страницу
    addAttractionsToHtml();
}


//Заполнение списка достопримечательностей
function addAttractionsToList(attractions) 
{
    let listAttractions = attractions.split("-");//Разделение строки на достопримечательности

    for (let i = 0; i < listAttractions.length; i++) //Обработка каждой достопримечательности
    {
        listAttractions[i] = listAttractions[i].trim();

        if (globalListAttractions.indexOf(listAttractions[i]) < 0)
        {
            globalListAttractions.push(listAttractions[i]);
        } 
    }
}

function addAttractionsToHtml() 
{
    let attractionsListHtml = document.querySelector(".list-attractions");

    for (let i = 0; i < globalListAttractions.length; i++) 
    {
        let attractionsForCopy = document.querySelector(".exaple-attractions");
        let Attractions = attractionsForCopy.cloneNode(true);
        Attractions.classList = "";
        Attractions.innerHTML = "";
        Attractions.innerHTML += globalListAttractions[i].substring(0, 60);
        Attractions.setAttribute("class", "elem-attractions");
        Attractions.setAttribute("value", globalListAttractions[i]);
        attractionsListHtml.append(Attractions);
    }
}

//Сортировка маршрутов 
function sortJson(oldJson, searchElement, searchText) 
{
    const jsonLength = oldJson.length;
    let newJson = [];

    for (let i = 0; i < jsonLength; i++) 
    {
        let jsonElement = oldJson[i];

        if (searchElement == "name") 
        {
            let sName = jsonElement.name.toLowerCase();
            searchText = searchText.toLowerCase();

            if (sName.includes(searchText)) 
            {
                newJson.push(jsonElement);
            }
        } 

        else if (searchElement == "mainObject") 
        {
            if (jsonElement.mainObject.includes(searchText)) 
            {
                newJson.push(jsonElement);
            }
        } 

        else if (searchElement == "language") 
        {
            let sName = jsonElement.language.toLowerCase();
            searchText = searchText.toLowerCase().trim();

            if (sName.includes(searchText)) 
            {
                newJson.push(jsonElement);
            }
        }
    }
    SortListRoutes = newJson;
    return newJson;
}

//сортирует список маршрутов по заданным критериям (название или достопримечательность) и возвращает отсортированный список
function SortRoutes() 
{
    let listRoutes = globalListRoutes.map(a => Object.assign({}, a));
    let nameRoute = document.querySelector(".search-routes").value;
    let tListAtract = document.querySelector(".list-attractions");
    let attractionsRoute = tListAtract.options[tListAtract.selectedIndex].value;
    if (attractionsRoute || nameRoute) 
    {
        if (nameRoute) 
        {
            listRoutes = sortJson(listRoutes, "name", nameRoute);
        }

        if (attractionsRoute) 
        {
            listRoutes = sortJson(listRoutes, "mainObject", attractionsRoute);
        }
    } 
    else 
    {
        listRoutes = globalListRoutes;
    }
    temporaryListRoutes = listRoutes;
    return listRoutes;
}

//Поиск маршрутов по достопримечательностям
function searchByAttractions(event) 
{
    let listRoutes = SortRoutes();

    if (listRoutes.length == 0) 
    {
        loadRoutes(0, listRoutes);
    } 
    else 
    {
        loadRoutes(1, listRoutes);
    }
}

//Поиск маршрутов по названию
function searchByName(event) 
{
    let listRoutes = SortRoutes();

    if (listRoutes.length == 0) 
    {
        loadRoutes(0, listRoutes);
    } 
    else 
    {
        loadRoutes(1, listRoutes);
    }
}

//Обработчик события при выборе маршрута
function radioRouteChange(event) 
{
    let thisSelectRout = document.querySelector("[data-id='" + selectRoute + "']");

    if (selectRoute && thisSelectRout)
    {
        thisSelectRout.parentNode.parentNode.classList.remove("select-route");
    }  
    selectRoute = event.target.value;
    event.target.parentNode.parentNode.classList.add("select-route");
    let contentBtn = document.querySelector(".container-btn-make-an-application");
    contentBtn.classList.add("d-none");
    stratLoadGuideList(event.target.value);
}

//Загрузка количества страниц и выбранной страницы 
function loadNumberPages(numberPage, maxPages) 
{
    let page0 = document.querySelector("[data-page=\"0-excursions\"]");
    let page1 = document.querySelector("[data-page=\"1-excursions\"]");
    let page2 = document.querySelector("[data-page=\"2-excursions\"]");
    let page3 = document.querySelector("[data-page=\"3-excursions\"]");
    let page4 = document.querySelector("[data-page=\"4-excursions\"]");
    let page5 = document.querySelector("[data-page=\"5-excursions\"]");
    let page6 = document.querySelector("[data-page=\"6-excursions\"]");

    page1.innerHTML = Number(numberPage) - 2;
    page2.innerHTML = Number(numberPage) - 1;
    page3.innerHTML = Number(numberPage);
    page4.innerHTML = Number(numberPage) + 1;
    page5.innerHTML = Number(numberPage) + 2;

    page0.classList.remove("d-none");
    page1.classList.remove("d-none");
    page2.classList.remove("d-none");
    page3.classList.remove("d-none");
    page4.classList.remove("d-none");
    page5.classList.remove("d-none");
    page6.classList.remove("d-none");
    page3.classList.add("active");

    if (numberPage == 0) 
    {
        page0.classList.add("d-none");
        page1.classList.add("d-none");
        page2.classList.add("d-none");
        page3.classList.add("d-none");
        page4.classList.add("d-none");
        page5.classList.add("d-none");
        page6.classList.add("d-none");
        page3.classList.add("active");
    }

    if (numberPage == 1) 
    {
        page0.classList.add("d-none");
        page1.classList.add("d-none");
        page2.classList.add("d-none");
    } 

    else if (numberPage == 2) 
    {
        page1.classList.add("d-none");
    } 

    else if (numberPage == maxPages - 1) 
    {
        page5.classList.add("d-none");
    } 

    else if (numberPage == maxPages) 
    {
        page4.classList.add("d-none");
        page5.classList.add("d-none");
        page6.classList.add("d-none");
    }

    if (maxPages == 1) 
    {
        page4.classList.add("d-none");
        page5.classList.add("d-none");
        page6.classList.add("d-none");
    } 

    else if (maxPages == 2) 
    {
        page5.classList.add("d-none");

        if (numberPage == 2) 
        {
            page4.classList.add("d-none");
            page6.classList.add("d-none");
        }
    }
}

//Обработчик события для переключения страниц
function clickPageBtn(event) 
{
    if (event.target.dataset.page) 
    {
        if (event.target.dataset.page == "0-excursions") 
        {
            loadRoutes(1, temporaryListRoutes);
        } 
        
        else if (event.target.dataset.page == "6-excursions") 
        {
            loadRoutes(countOfPages, temporaryListRoutes);
        } 
        else 
        {
            loadRoutes(Number(event.target.innerHTML), temporaryListRoutes);
        }
    }
}


//Кнопки Скрыть и Подробнее

function HideMore() {}

function HideMore() 
{
    let allDescription = document.querySelectorAll('.description-more-detals');

    for (let i = 0; i < allDescription.length; i++) 
    {
        allDescription[i].onclick = descriptionMoreDetals;
    }

    let allMainObject = document.querySelectorAll('.mainObject-more-detals');

    for (let i = 0; i < allMainObject.length; i++) 
    {
        allMainObject[i].onclick = mainObjectMoreDetals;
    }

    let allDescripLess = document.querySelectorAll('.description-less-detals');

    for (let i = 0; i < allDescripLess.length; i++) 
    {
        allDescripLess[i].onclick = descriptionHide;
    }

    let allMainObjectLes = document.querySelectorAll('.mainObject-less-detals');

    for (let i = 0; i < allMainObjectLes.length; i++) 
    {
        allMainObjectLes[i].onclick = mainObjectHideDetals;
    }
}


function descriptionHide(event) 
{
    let fullDescription = event.target.parentNode.innerHTML.trim();
    let indexSim = fullDescription.indexOf("<");
    fullDescription = fullDescription.substring(0, indexSim);
    event.target.parentNode.innerHTML = event.target.value + "<br><button type=\"button\" class=\"btn btn-link " + "p-0 m-0 description-more-detals\" value=\"  " + fullDescription + "\"> Подробнее </button>";
    HideMore();
}

function mainObjectHideDetals(event) 
{
    let fullMainObject = event.target.parentNode.innerHTML.trim();
    fullMainObject = fullMainObject.substring(0, fullMainObject.indexOf("<"));
    event.target.parentNode.innerHTML = event.target.value + "<br><button type=\"button\" class=\"btn btn-link " + "p-0 m-0 mainObject-more-detals\" value=\"" + fullMainObject + "\"> Подробнее </button>";
    HideMore();
}

function descriptionMoreDetals(event) 
{
    event.target.parentNode.innerHTML = event.target.value + "<br><button type=\"button\" class=\"btn btn-link " + "p-0 m-0 description-less-detals\" value=\"" + event.target.value.substring(0, 100) + "\"> Скрыть </button>";
    HideMore();
}

function mainObjectMoreDetals(event) 
{
    event.target.parentNode.innerHTML = event.target.value + "<br><button type=\"button\" class=\"btn btn-link " + "p-0 m-0 mainObject-less-detals\" value=\"" + event.target.value.substring(0, 100) + "\"> Скрыть </button>";
    HideMore();
}


//Таблица гидов

//Загрузка списка гидов с сервера 
async function downloadGuidesFromServer(idRoute) 
{
    let thisUrl = new URL(url + "/routes/" + idRoute + "/guides");
    thisUrl.searchParams.append("api_key", key);

    try 
    {
        let response = await fetch(thisUrl, { method: "GET" });
        let guides = await response.json();
        globalListGuides = guides;
        return guides;
    } 

    catch (error) 
    {
        showAlert(error.message, "alert-danger");
    }
}

async function stratLoadGuideList(idRoute) 
{
    document.querySelector(".guidesList").classList.remove("d-none");
    let guides = await downloadGuidesFromServer(idRoute);
    let oldElemLanguage = document.querySelectorAll(".element-language");

    for (let i = 0; i < oldElemLanguage.length; i++)
    {
        oldElemLanguage[i].parentNode.removeChild(oldElemLanguage[i]);
    }
        
    for (let i = 0; i < guides.length; i++)
    {
        addLanguageSort(guides[i].language);
    }    
    loadGuideList(guides);
}

//Добавление гидов в таблицу Html
function addNewGuides(number, Eleminfo) 
{
    let exapleGuide = document.querySelector(".exaple-guide").cloneNode(true);
    exapleGuide.innerHTML = "";
    exapleGuide.classList = "guide";
    exapleGuide.innerHTML += "<td scope=\"row\">" + number + "</td>";
    exapleGuide.innerHTML += "<td class=\"profile\"><img " + "src=\"images\\profile.jpg\" alt=\"\" class=\"img-fluid\"></td>";
    exapleGuide.innerHTML += "<td>" + Eleminfo.name + "</td>";
    exapleGuide.innerHTML += "<td>" + Eleminfo.language + "</td>";
    exapleGuide.innerHTML += "<td class=\"text-center\">" + Eleminfo.workExperience + "</td>";
    exapleGuide.innerHTML += "<td class=\"text-center\">" + Eleminfo.pricePerHour + " <i class=\"fa fa-rub\" aria-hidden=\"true\"></i></td>";
    let check_input;

    if (selectGuide && Eleminfo.id == selectGuide) 
    {
        exapleGuide.classList.add("select-guide");
        check_input = "<td><input checked class=\"form-check-input " + "radio-guide\" type=\"radio\" name=\"radio-guide\" value=\"" + Eleminfo.id + "\" data-id=\"" + Eleminfo.id + "\"></td>";
    } 
    else 
    {
        check_input = "<td><input class=\"form-check-input " + "radio-guide\" type=\"radio\" name=\"radio-guide\" value=\"" + Eleminfo.id + "\" data-id=\"" + Eleminfo.id + "\"></td>";
    }
    exapleGuide.innerHTML += check_input;
    let listGuide = document.querySelector(".list-guide");
    listGuide.append(exapleGuide);
}

//Загрузка таблицы с гидами
function loadGuideList(guides) 
{
    let allGuide = document.querySelectorAll(".guide");

    for (let i = 0; i < allGuide.length; i++) 
    {
        allGuide[i].parentNode.removeChild(allGuide[i]);
    }

    for (let i = 0; i < guides.length; i++) 
    {
        addNewGuides(i + 1, guides[i]);
    }
    document.querySelector('.list-language').onchange = searchByLanguage;
    let radioList = document.querySelectorAll('.radio-guide');

    for (let i = 0; i < radioList.length; i++) 
    {
        elem = radioList[i];
        elem.onchange = radioGuideSelect;
    }
}

//Сортировка гидов
function SortGuides() {
    let listGuides = globalListGuides.map(a => Object.assign({}, a));
    let languageGuides = document.querySelector(".list-language").value;

    if (languageGuides || experienceFrom || experienceTo) 
    {
        if (languageGuides) 
        {
            listGuides = sortJson(listGuides, "language", languageGuides);
        }

        if (experienceFrom || experienceTo) 
        {
            listGuides = sortWorkExp(listGuides, experienceFrom, experienceTo);
        }
    } 
    else 
    {
        listGuides = globalListGuides;
    }
    newListGuides = listGuides;
    return listGuides;
}

function searchById(jsonArray, idElem) 
{
    for (let i = 0; i < jsonArray.length; i++)
    {
        if (jsonArray[i].id == idElem) return jsonArray[i];
    }    
}

//Сортировка по опыту работы
function sortWorkExp(oldJson, expFrom, expTo) 
{
    const jsonLength = oldJson.length;
    let newJson = [];
    expFrom = Number(expFrom);
    expTo = Number(expTo);

    for (let i = 0; i < jsonLength; i++) 
    {
        let jsonElement = oldJson[i];
        if (expFrom >= 0 || expTo >= 0) 
        {
            if (expFrom >= 0 && expTo >= 0 && expTo >= expFrom) 
            {
                if (expFrom <= jsonElement.workExperience && expTo >= jsonElement.workExperience) 
                {
                    newJson.push(jsonElement);
                }
            } 

            else if (expFrom >= 0) 
            {
                if (expFrom <= jsonElement.workExperience) 
                {
                    newJson.push(jsonElement);
                }
            } 

            else if (expTo >= 0) 
            {
                if (expTo >= jsonElement.workExperience) 
                {
                    newJson.push(jsonElement);
                }
            }
        } 
        else 
        {
            newJson = oldJson;
        }
    }

    if (!expFrom && !expTo) 
    {
        newJson = oldJson;
    }
    return newJson;
}

//Добавление сортировки по языку
function addLanguageSort(language) 
{
    let listLanguage = document.querySelector(".list-language");

    if (listLanguage.innerHTML.indexOf(language) == -1) 
    {
        listLanguage.innerHTML += "<option value=\" " + language + "\" class=\"element-language\">" + language + "</option>";
    }
}

//Выбор языка в таблице гидов
function searchByLanguage(event) 
{
    let listGuides = SortGuides();
    loadGuideList(listGuides);
}

//Функция поиска гида по опыту работы
function searchbyExperienceWork() 
{
    loadGuideList(SortGuides());
}

//Обработчики события ввода опыта работы
function searchExperienceFrom(event) 
{
    experienceFrom = event.target.value;
    searchbyExperienceWork();
}

function searchExperienceTo(event) 
{
    experienceTo = event.target.value;
    searchbyExperienceWork();
}

//Обработчик событий при выборе гида
function radioGuideSelect(event) 
{
    let documentElem = document.querySelector("[data-id='" + selectGuide + "']");

    if (selectGuide && documentElem) 
    {
        let documentSelectGuide = document.querySelector("[data-id='" + selectGuide + "']");
        documentSelectGuide.parentNode.parentNode.classList.remove("select-guide");
    }
    selectGuide = event.target.value;
    event.target.parentNode.parentNode.classList.add("select-guide");
    let contentBtn = document.querySelector('.container-btn-make-an-application');
    contentBtn.classList.remove("d-none");
}


//Подсчет стоимости и опции заказов

//Расчет итоговой стоимости
function costCalculation(event) 
{
    price = 1;
    let isThisDayOff;
    let modSelTim = document.querySelector('.modal-select-time');
    let guideCost = searchById(globalListGuides, selectGuide).pricePerHour;
    let hoursNumber = Number(modSelTim.options[modSelTim.selectedIndex].value);
    price = price * guideCost * hoursNumber;
    
    if (document.querySelector('.modal-date').valueAsDate) 
    {
        let modalDate = document.querySelector('.modal-date');
        let day = modalDate.valueAsDate.getUTCDate();
        let Daynumber = modalDate.valueAsDate.getUTCDay();
        let month = modalDate.valueAsDate.getUTCMonth() + 1;

        if (Daynumber == 6 || Daynumber == 0) 
        {
            isThisDayOff = 1.5;
        }

        else if (((month == 1) && (day >= 1 && day <= 9)) || ((month == 3) && (day >= 6 && day <= 8)) || ((month == 4) && (day >= 30) || (month == 5) && (day <= 3)) || ((month == 5) && (day >= 7 && day <= 10)) || ((month == 6) && (day >= 11 && day <= 13)) || ((month == 11) && (day >= 4 && day <= 6))) 
        {
            isThisDayOff = 1.5;
        } 
        else 
        {
            isThisDayOff = 1;
        }
        price = price * isThisDayOff;
    }
    let isItMorning;
    let isItEvening;

    if (document.querySelector('.modal-time').value) 
    {
        let modalTime = document.querySelector('.modal-time');
        let hoursTime = Number(modalTime.value.split(":")[0]);

        if (hoursTime >= 9 && hoursTime <= 12) 
        {
            isItMorning = 400;
            isItEvening = 0;
        } 

        else if (hoursTime >= 20 && hoursTime <= 23) 
        {
            isItEvening = 1000;
            isItMorning = 0;
        } 
        else 
        {
            isItMorning = 0;
            isItEvening = 0;
        }
        price = price + isItMorning + isItEvening;
    }
    let numberOfVisitors;
    let modalNumberPeople = document.querySelector('.modal-number-people');
    let numberPeople = Number(modalNumberPeople.value);

    if (document.querySelector('.modal-number-people').value) 
    {
        if (numberPeople >= 1 && numberPeople <= 5) 
        {
            numberOfVisitors = 0;
        }

        else if (numberPeople > 5 && numberPeople <= 10) 
        {
            numberOfVisitors = 1000;
        }

        else if (numberPeople > 10 && numberPeople <= 20) 
        {
            numberOfVisitors = 1500;
        }
        price = price + numberOfVisitors;
    }
    let modFirstAdit = document.querySelector('.modal-first-additional-option');
    let modSecAdit = document.querySelector('.modal-second-additional-option');
    let firstOptionCost;
    let secondOptionCost;
    let oldPrice;
    let oldPriceCopy;

    if (modFirstAdit.checked || modSecAdit.checked) 
    {
        if (modFirstAdit.checked && modSecAdit.checked) 
        {
            oldPrice = price;
            firstOptionCost = 1000 * numberPeople;
            price = Math.round(oldPrice + firstOptionCost);
            oldPriceCopy = price;
            secondOptionCost = 500 * numberPeople;
            price = Math.round(oldPriceCopy + secondOptionCost);
        } 

        else if (modFirstAdit.checked) 
        {
            oldPrice = price;
            firstOptionCost = 1000 * numberPeople;
            price = Math.round(oldPrice + firstOptionCost);
        } 

        else if (modSecAdit.checked) 
        {
            oldPrice = price;
            secondOptionCost = 500 * numberPeople;
            price = Math.round(oldPrice + secondOptionCost);
        }
    }
    document.querySelector('.modal-price').innerHTML = "Итоговая стоимость: " + price  + " <i class=\"fa fa-rub\" aria-hidden=\"true\"></i>";

    //Отображение первой опции
    let viewFirst = document.querySelector('.view-first-addition');

    if (document.querySelector('.modal-first-additional-option').checked) 
    {
        viewFirst.innerHTML = "Стоимость увеличена на: " + firstOptionCost + " <i class=\"fa fa-rub\" aria-hidden=\"true\"></i>";
    } 
    else 
    {
        viewFirst.innerHTML = "";
    }

    //Отображение второй опции
    let viewSecond = document.querySelector('.view-second-addition');

    if (document.querySelector('.modal-second-additional-option').checked) 
    {
        viewSecond.innerHTML = "Стоимость увеличена на: " + secondOptionCost + " <i class=\"fa fa-rub\" aria-hidden=\"true\"></i>";
    } 
    else 
    {
        viewSecond.innerHTML = "";
    }
}


//Оформление заявки

//Создать заявку
function clickOnCreateApplication(event) 
{
    document.querySelector('.modal-make-FIO').innerHTML = "Фио гида: " + searchById(globalListGuides, selectGuide).name;
    document.querySelector('.modal-make-name-route').innerHTML = "Название маршрута: " + searchById(globalListRoutes, selectRoute).name;
    document.querySelector('.modal-first-additional-option').checked = false;
    document.querySelector('.modal-second-additional-option').checked = false;
    let nowDate = new Date();
    var day = ("0" + nowDate.getDate()).slice(-2);
    var month = ("0" + (nowDate.getMonth() + 1)).slice(-2);
    document.querySelector('.modal-date').value = nowDate.getFullYear() + "-" + day + "-" + month;
    document.querySelector('.modal-time').value = "09:00";
    document.querySelector('.modal-select-time').selectedIndex = 0;
    document.querySelector('.modal-number-people').value = "1";
    costCalculation();
}

//Изменение формата даты на YYYY-MM-DD
function editDate(oldDate) 
{
    let newDate = "";
    newDate += oldDate.getUTCFullYear() + "-";
    newDate += oldDate.getUTCMonth() + 1 + "-";
    newDate += oldDate.getUTCDate();
    return newDate;
}

//Сохранение заявки
async function savingApplication(event) 
{
    if (!(document.querySelector('.modal-date').valueAsDate && document.querySelector('.modal-time').value && document.querySelector('.modal-number-people').value)) 
    {
        alert("Заполните все необходимые поля");
        return;
    }
    let formData = new FormData();
    formData.append('guide_id', selectGuide);
    formData.append('route_id', selectRoute);
    let modalDate = document.querySelector('.modal-date');
    formData.append('date', editDate(modalDate.valueAsDate));
    let minuts = document.querySelector('.modal-time').value.split(':')[1];

    if (minuts != "00" && minuts != "30") 
    {
        alert("Время начала экскурсии в 0 или 30 минут");
        return;
    }
    formData.append('time', document.querySelector('.modal-time').value);
    let modalSetTime = document.querySelector('.modal-select-time');
    formData.append('duration', modalSetTime.value);
    let modalNumberPeople = document.querySelector('.modal-number-people');
    formData.append('persons', modalNumberPeople.value);
    formData.append('price', price);
    let modFirstOpt = document.querySelector('.modal-first-additional-option');
    let modSeconOpt = document.querySelector('.modal-second-additional-option');
    formData.append('optionFirst', Number(modFirstOpt.checked));
    formData.append('optionSecond', Number(modSeconOpt.checked));
    let thisUrl = new URL(url + "/orders");
    thisUrl.searchParams.append("api_key", key);

    try 
    {
        let response = await fetch(thisUrl, { method: "POST", body: formData });
        if (response.status == 200) 
        {
            await response.json();
            bootstrap.Modal.getOrCreateInstance(makeAnApplication).hide();
            showAlert("Заявка успешно создана.", "alert-primary");
            clearMainWindow();
        } 
        else 
        {
            let data = await response.json();
            alert(data.error);
        }
    } 

    catch (err) 
    {
        showAlert(err.message, "alert-danger");
    }
}

//Очистка главой страницы
function clearMainWindow() 
{
    let tSelRout = document.querySelector("[data-id='" + selectRoute + "']");

    if (selectRoute && tSelRout) 
    {
        tSelRout.parentNode.parentNode.classList.remove("select-route");
        tSelRout.checked = false;
    }
    selectRoute = 0;
    selectGuide = 0;
    let contBtn = document.querySelector('.container-btn-make-an-application');
    contBtn.classList.add("d-none");
    document.querySelector('.guidesList').classList.add("d-none");
}


//Функции
window.onload = function () 
{
    //Выбор страницы с маршрутами
    document.querySelector('.pagination').onclick = clickPageBtn; 
    //Загрузка первой страницы маршрутов
    loadRoutesStart(1); 
    //Поиск по названию маршрута
    let searchRoutes = document.querySelector('.search-routes');
    searchRoutes.addEventListener('input', searchByName);
    //Поиск по достопримечательностям
    document.querySelector('.list-attractions').onchange = searchByAttractions; 
    //Поиск гида по опыту работы ОТ
    let docExpFrom = document.querySelector('.experience-from');
    docExpFrom.addEventListener('input', searchExperienceFrom); 
    //Поиск гида по опыту работы ДО
    let docExpUpTo = document.querySelector('.experience-up-to');
    docExpUpTo.addEventListener('input', searchExperienceTo); 
    //Кнопка оформить заявку
    let btnMakeAnAppl = document.querySelector('.btn-make-an-application');
    btnMakeAnAppl.onclick = clickOnCreateApplication; 
    //Изменение формы заявки для подсчета стоимости 
    let modalNumberPeople = document.querySelector(".modal-number-people");
    let modalSelectTime = document.querySelector(".modal-select-time");
    let modalDate = document.querySelector(".modal-date");
    let modalTime = document.querySelector(".modal-time");
    let modFiOp = document.querySelector(".modal-first-additional-option");
    let modSeOp = document.querySelector(".modal-second-additional-option");
    modalDate.addEventListener('change', function () 
    {
        costCalculation();
    });
    modalTime.addEventListener('change', function () 
    {
        costCalculation();
    });
    modalSelectTime.addEventListener('change', function () 
    {
        costCalculation();
    });
    modalNumberPeople.addEventListener('change', function () 
    {
        costCalculation();
    });
    modFiOp.addEventListener('change', function () 
    {
        costCalculation();
    });
    modSeOp.addEventListener('change', function () 
    {
        costCalculation();
    });
    let modalBtnSave = document.querySelector('.modal-btn-save');
    modalBtnSave.onclick = savingApplication; //Сохранение заявки
};

