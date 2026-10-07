# Guide : mettre à jour le contenu du site

Le site se met à jour uniquement en modifiant des fichiers Markdown dans `content/`, depuis Obsidian. Aucun code à toucher.

La mise en page est reconstruite automatiquement à partir de la **structure des titres** (`#`, `##`, `###`). Il suffit donc de respecter les règles ci-dessous.

## Prévisualiser et publier

```bash
npm install                 # une seule fois
npx quartz build --serve    # aperçu local, se met à jour à chaque sauvegarde
npx quartz build            # génère le site final dans public/
```

## Organisation des fichiers

```
content/
├── index.md          # accueil
├── about.md
├── contact.md
├── work/             # une page par projet
│   └── ors.md
└── assets/
    ├── logo/
    └── images/
        └── ORS/      # un dossier d'images par projet
```

L'adresse d'une page vient de son nom de fichier : `content/work/ors.md` devient `/work/ors`. Évite les espaces et les accents dans les noms de fichiers.

---

## 1. Pages simples (accueil, about, contact)

### Modèle

```markdown
---
type: page
title: "About"
nav: 2
---
# About

Premier paragraphe d'introduction.

Deuxième paragraphe.

## titre de section

Contenu de la section.

## autre section

### Colonne A
Texte ou liste.

### Colonne B
Texte ou liste.
```

### Règles

| Ce que tu écris | Ce que ça donne |
| --- | --- |
| `# Titre` (premier titre du fichier) | Titre de la page. **Il n'est pas affiché** : mets-le quand même. |
| Texte avant le premier `##` | Bloc d'introduction en haut de page |
| `## titre` | Section avec un titre en gras et une ligne en pointillés. Le titre est affiché **tel que tu l'écris** (sur ton site d'origine, ils sont en minuscules : `selected projects`). |
| Un ou plusieurs `###` dans une section | Colonnes côte à côte (3 sur grand écran, 1 sur mobile) |
| Paragraphes qui se suivent | Regroupés dans un seul paragraphe, séparés par une ligne vide |

Quelques précisions :

- Une section sans `###` s'affiche en une seule colonne.
- Dans une section en colonnes, les listes s'affichent **sans puces** et avec des colonnes plus rapprochées (`2rem`). Si les colonnes ne contiennent que du texte, l'écart est plus large (`6rem`). Hors colonnes, les listes ont des puces.
- Dans l'introduction, une liste s'affiche aussi sans puces (c'est le cas sur la page contact).
- Utilise uniquement `##` pour les sections et `###` pour les colonnes. Les niveaux `####` et plus ne sont pas mis en forme.

### Ajouter une page au menu

Ajoute `nav: <numéro>` dans l'en-tête (frontmatter) de la page. Les pages sont triées par ce numéro.

```yaml
nav: 4
nav_label: "press"   # optionnel : sinon le nom du fichier est utilisé
```

Une page sans `nav` existe mais n'apparaît pas dans le menu.

### Tableaux (liste « année / activité »)

```markdown
| Year | Activity |
| --- | --- |
| 2025 | Le Cube Garges, FR, Video games and world building, 5 days |
|  | IMT Atlantique, Nantes, FR, Game jam, 5 days |
| 2024 | Arquivo, Leiria, PT, AI for artists, 1 day |
```

- **Garde toujours la ligne d'en-tête** (`Year | Activity`) : elle est obligatoire en Markdown, mais elle est masquée sur le site.
- Laisse la cellule de l'année **vide** pour continuer sur la même année.
- Pour un retour à la ligne dans une cellule, écris `<br>` (une seule fois, pas deux).
- Pour de l'italique dans une cellule : `*texte*`.

---

## 2. Pages projet (`content/work/*.md`)

Tout fichier du dossier `work/` est traité comme un projet.

### Modèle

```markdown
---
type: project
title: "Meandering River"
---
# Meandering River

Premier paragraphe.

Deuxième paragraphe, avec un [lien](https://exemple.com).

> Une citation. Elle s'affiche en italique.

## Credits

- **Creative Direction:** Cedric Kiefer as [onformative](https://onformative.com/)
- **Production:** Aurélien Krieger

## Images

![[assets/images/meanderingriver/photo_01.jpg]]

*Photo credit: onformative*

![[assets/images/meanderingriver/photo_02.jpg]]
```

### Règles

| Ce que tu écris | Ce que ça donne |
| --- | --- |
| `# Titre` | Titre du projet, colonne de gauche |
| Paragraphes | Texte de la colonne de gauche |
| `> citation` | Texte en italique, intégré au paragraphe précédent |
| `## Credits` + liste | Liste de crédits : rôle sur une ligne, noms sur la suivante |
| `## Images` | Colonne de droite |
| Autre `## Titre` | Sous-titre dans la colonne de gauche (par exemple `## Clients and partners`) |

### Crédits

Chaque ligne suit ce format : `- **Rôle:** nom ou [lien](url)`.

- Le rôle doit être **en gras**. Il est affiché tel que tu l'écris : `**Artists**` donne « Artists », `**Artists:**` donne « Artists: ». Ton site d'origine n'était pas uniforme, vérifie donc la page d'origine si tu veux la même chose.
- Plusieurs noms sur une même ligne sont séparés par des virgules : `- **Artists:** [A](https://a.com), [B](https://b.com)`.
- Une ligne sans rôle en gras s'affiche sur une seule ligne.
- Le bloc `## Credits` est facultatif.

### Images et légendes

- Place les fichiers dans `content/assets/images/<dossier-du-projet>/`.
- Insère-les avec `![[assets/images/<dossier>/<fichier>.jpg]]` (syntaxe Obsidian).
- La **légende est facultative**. Pour en ajouter une, écris-la juste après l'image, **séparée par une ligne vide**, avec le texte **entièrement en italique** : `*Photo credit: ...*`.
- Si la ligne suivante n'est pas uniquement en italique, elle n'est pas prise pour une légende.
- Toutes les images sont affichées à 640 px de large maximum, alignées à droite, quelle que soit leur taille d'origine.
- Les images apparaissent dans l'ordre où tu les écris.

---

## 3. Ajouter un nouveau projet, pas à pas

1. Copie un projet existant, par exemple `content/work/ors.md`, et renomme-le (`mon-projet.md`).
2. Modifie `title`, le `# Titre`, le texte, les crédits.
3. Crée `content/assets/images/mon-projet/` et dépose les images dedans.
4. Mets à jour les chemins dans `## Images`.
5. Ajoute le projet à la liste de l'accueil, dans `content/index.md` :

   ```markdown
   - [[work/mon-projet|Mon projet]] — description courte
   ```

6. Lance `npx quartz build --serve` et vérifie la page.

## 4. Liens

- **Lien externe** : `[texte](https://site.com)`. Il s'ouvre dans un nouvel onglet.
- **Lien vers une page du site** : `[[work/ors|ORS]]`, soit le chemin du fichier sans `.md`, puis `|`, puis le texte affiché.
- **Lien vers une page à la racine** : `[[about|about]]`.

Tous les liens prennent automatiquement le style du site (orange, inversé au survol).

---

## 5. Titre, métadonnées et image de partage

- **Titre de l'onglet** : généré automatiquement. Il vaut `Aurélien Krieger - <title>`. Pour l'accueil, il vaut simplement `Aurélien Krieger`.
- **Réglages valables pour tout le site**, dans l'en-tête de `content/index.md` :

  ```yaml
  description: "Producer for art, education & cultural projects."
  image: assets/images/aurelienkrieger_com.jpg
  image_width: 688
  image_height: 689
  author: "Aurélien Krieger"
  keywords: "art, engineer, science, technology, education, culture"
  url: "https://www.aurelienkrieger.com"
  ```

  `url` sert aux balises `og:url` et `twitter:url`, comme sur ton site d'origine.

- **Pour changer une seule page**, ajoute dans son en-tête `description`, `image`, `author` ou `keywords`.
- **Image de partage d'un projet** : ajoute `image: assets/images/<dossier>/<fichier>.jpg`. Les dimensions sont lues dans le nom du fichier s'il se termine par `-1024x683` ; sinon, ajoute `image_width` et `image_height`. Sans `image`, la page utilise l'image du site.
- **Lien canonique** (`<link rel="canonical">`) : généré automatiquement pour chaque page.
- **Sur ton site d'origine**, `og:title` valait `Aurélien Krieger` sur toutes les pages. C'est toujours le cas.

## 6. Polices

Les polices sont tes fichiers d'origine `Inter-Regular.ttf`, `Inter-Light.ttf` et `Inter-ExtraLight.ttf`, dans `content/assets/font/`. Le site n'appelle plus Google Fonts. Ne supprime pas ce dossier.

## 7. Page d'erreur 404

Elle est gérée par le code (`quartz/components/pages/404.tsx`). Pour changer son texte, c'est le seul fichier à modifier.

---

## 8. À éviter

- Ne mets pas de HTML dans le contenu, sauf `<br>` dans une cellule de tableau.
- Ne mets qu'un seul `#` par fichier, tout en haut.
- N'utilise pas `#` pour des sections : utilise `##`.
- Ne saute pas de niveau de titre (pas de `###` sans `##` avant).
- N'oublie pas la ligne d'en-tête d'un tableau.
- Ne colle pas la légende contre l'image : laisse une ligne vide entre les deux.
- Les champs `featured`, `home_order`, `summary` et `cover` des fichiers projet ne sont pas utilisés. Tu peux les laisser ou les supprimer.

## 9. Liste de vérification avant de publier

- [ ] L'en-tête (`---`) contient `type` et `title`.
- [ ] Il y a un seul `#`, tout en haut.
- [ ] Les liens externes commencent par `https://`.
- [ ] Les chemins d'images correspondent à des fichiers existants dans `content/assets/images/`.
- [ ] Les légendes sont en italique, séparées de l'image par une ligne vide.
- [ ] Le projet est ajouté à la liste de `index.md`.
- [ ] La page a été relue en aperçu local, sur grand écran et en largeur mobile.
