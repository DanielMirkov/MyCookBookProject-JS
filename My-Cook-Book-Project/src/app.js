async function getRecipeList() {
    const url = 'http://localhost:3030/data/recipes?select=_id%2Cname%2Cimg';


    const response = await fetch(url);

    if (response.ok == false) {
        throw new Error(response.statusText);
    }

    const recipes = await response.json();

    return Object.values(recipes);

    // fetch(url)
    //     .then(response => response.json())
    //     .then(recipes => {
    //         main.innerHTML = '';
    //         Object.values(recipes).forEach(r => {
    //             const result = e('article', { className: 'preview' },
    //                 e('div', { className: 'title' }, e('h2', {}, r.name)),
    //                 e('div', { className: 'small' }, e('img', { src: r.img }))
    //             );
    //             main.appendChild(result);
    //         });
    //     })
    //     .catch(er => {
    //         alert(er.message);
    //     });

}

function createPreview(recipe) {
    const result = e('article', { className: 'preview' },
        e('div', { className: 'title' }, e('h2', {}, recipe.name)),
        e('div', { className: 'small' }, e('img', { src: recipe.img }))
    );

    result.addEventListener('click', () => getRecipeDetails(recipe._id, result));

    return result;
}

async function getRecipeDetails(id, preview) {
    const url = 'http://localhost:3030/data/recipes/' + id;

    const response = await fetch(url);
    const data = await response.json();

    //console.log(data);
    const result = e('article', {},
        e('h2', { onClick: toggleCard }, data.name),
        e('div', { className: 'band' },
            e('div', { className: 'thumb' }, e('img', { src: data.img })),
            e('div', { className: 'ingredients' },
                e('h3', {}, 'Ingredients:'),
                e('ul', {}, data.ingredients.map(i => e('li', {}, i)))
            )
        ),
        e('div', { className: 'description' },
            e('h3', {}, 'Preparation:'),
            data.steps.map(s => e('p', {}, s)),

        )
    );

    // preview.parentNode.replaceChild(result, preview);
    preview.replaceWith(result);

    function toggleCard() {
        result.replaceWith(preview);
    }
}

window.addEventListener('load', async() => {
    const token = sessionStorage.getItem('userToken');
    if (token != null) {
        document.getElementById('user').style.display = 'inline-block';
        document.getElementById('logoutBtn').addEventListener('click', logout)
    } else {
        document.getElementById('guest').style.display = 'inline-block';

    }


    const main = document.querySelector('main');

    const recipes = await getRecipeList();
    const cards = recipes.map(createPreview);

    main.innerHTML = '';
    cards.forEach(c => main.appendChild(c));
});

async function logout() {
    const token = sessionStorage.getItem('userToken');
    const response = await fetch('http://localhost:3030/users/logout', {
        method: 'get',
        headers: { 'X-Authorization': token },
    });

    if (response.ok == false) {
        const error = await response.json();
        return alert(error.message);
    }

    sessionStorage.removeItem('userToken');
    window.location.pathname = 'index.html';

}


function e(type, attributes, ...content) {
    const result = document.createElement(type);

    for (let [attr, value] of Object.entries(attributes || {})) {
        if (attr.substring(0, 2) == 'on') {
            result.addEventListener(attr.substring(2).toLowerCase(), value);
        } else {
            result[attr] = value;
        }
    }
    content = content.reduce((a, c) => a.concat(Array.isArray(c) ? c : [c]), []);

    content.forEach(f => {
        if (typeof f === 'string' || typeof f === 'number') {
            const node = document.createTextNode(f);
            result.appendChild(node);
        } else {
            result.appendChild(f);
        }
    });

    return result;
}