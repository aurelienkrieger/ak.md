# Guide : mettre à jour le contenu du site

Le site se met à jour uniquement en modifiant des fichiers Markdown dans `content/`, depuis Obsidian. 

La mise en page est reconstruite automatiquement à partir de la **structure des titres** (`#`, `##`, `###`) en respectant les règles ci-dessous.

## Prévisualiser et publier

```bash
npm install                 # une seule fois
npx quartz build --serve    # aperçu local
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

L'adresse d'une page vient de son nom de fichier : `content/work/ors.md` devient `/work/ors`. Éviter les espaces et les accents dans les noms de fichiers.

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

| Ce qui est écrit                       | Ce que cela donne                                                                                      |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `# Titre` (premier titre du fichier)   | Titre de la page. **Il n'est pas affiché** : l'indiquer quand même                                     |
| Texte avant le premier `##`            | Bloc d'introduction en haut de page                                                                    |
| `## titre`                             | Section avec un titre en gras et une ligne en pointillés. Le titre est affiché **tel qu'il est écrit** |
| Un ou plusieurs `###` dans une section | Colonnes côte à côte (3 sur grand écran, 1 sur mobile)                                                 |
| Paragraphes qui se suivent             | Regroupés dans un seul paragraphe, séparés par une ligne vide                                          |

Quelques précisions :

- Une section sans `###` s'affiche en une seule colonne
- Dans une section en colonnes, les listes s'affichent **sans puces** et avec des colonnes plus rapprochées (`2rem`). Si les colonnes ne contiennent que du texte, l'écart est plus large (`6rem`). Hors colonnes, les listes ont des puces
- Dans l'introduction, une liste s'affiche aussi sans puces (c'est le cas sur la page contact)
- Utiliser uniquement `##` pour les sections et `###` pour les colonnes. Les niveaux `####` et plus ne sont pas mis en forme.

### Ajouter une page au menu

Ajouter `nav: <numéro>` dans l'en-tête (frontmatter) de la page. Les pages sont triées par ce numéro.

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

- **Toujours garder la ligne d'en-tête** (`Year | Activity`) : elle est obligatoire en Markdown, mais elle est masquée sur le site
- Laisser la cellule de l'année **vide** pour continuer sur la même année
- Pour un retour à la ligne dans une cellule, écrire `<br>` (une seule fois).
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

| Ce qui est écrit     | Ce que cela donne                                                            |
| -------------------- | ---------------------------------------------------------------------------- |
| `# Titre`            | Titre du projet, colonne de gauche                                           |
| Paragraphes          | Texte de la colonne de gauche                                                |
| `> citation`         | Texte en italique, intégré au paragraphe précédent                           |
| `## Credits` + liste | Liste de crédits : rôle sur une ligne, noms sur la suivante                  |
| `## Images`          | Colonne de droite                                                            |
| Autre `## Titre`     | Sous-titre dans la colonne de gauche (par exemple `## Clients and partners`) |

### Crédits

Chaque ligne suit ce format : `- **Rôle:** nom ou [lien](url)`.

- Le rôle doit être **en gras**. Il est affiché tel qu'il est écrit : `**Artists**` donne « Artists », `**Artists:**` donne « Artists: »
- Plusieurs noms sur une même ligne sont séparés par des virgules : `- **Artists:** [A](https://a.com), [B](https://b.com)`.
- Une ligne sans rôle en gras s'affiche sur une seule ligne
- Le bloc `## Credits` est facultatif.

### Images et légendes

- Placer les fichiers dans `content/assets/images/<dossier-du-projet>/`
- Les insérer avec `![[assets/images/<dossier>/<fichier>.jpg]]` (Wikilink Obsidian)
- La **légende est facultative**. Pour en ajouter une, l'écrire juste après l'image, **séparée par une ligne vide**, avec le texte **entièrement en italique** : `*Photo credit: ...*`
- Si la ligne suivante n'est pas uniquement en italique, elle n'est pas prise pour une légende
- Toutes les images sont affichées à 640 px de large maximum, alignées à droite, quelle que soit leur taille d'origine
- Les images apparaissent dans l'ordre où elles sont écrites.

---

## 3. Ajouter un nouveau projet, pas à pas

1. Copier un projet existant, par exemple `content/work/ors.md`, et le renommer (`mon-projet.md`)
2. Modifier `title`, le `# Titre`, le texte, les crédits
3. Créer `content/assets/images/mon-projet/` et y déposer les images
4. Mettre à jour les chemins dans `## Images`
5. Ajouter le projet à la liste de `content/index.md` pour qu'il figure dans la page d'accueil :

   ```markdown
   - [[work/mon-projet|Mon projet]] — description courte
   ```

6. Lancer `npx quartz build --serve`.

## 4. Liens

- **Lien externe** : `[texte](https://site.com)`. S'ouvre dans un nouvel onglet
- **Lien vers une page du site** : `[[work/ors|ORS]]`
- **Lien vers une page à la racine** : `[[about|about]]`

---

## 5. Titre, métadonnées et image de partage

- **Titre de l'onglet** : généré automatiquement : `Aurélien Krieger - <title>`. Pour l'accueil, simplement : `Aurélien Krieger`.
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

  `url` sert aux balises `og:url` et `twitter:url`.

- **Pour changer une seule page**, ajouter dans son en-tête `description`, `image`, `author` ou `keywords`.
- **Image de partage d'un projet** : ajouter `image: assets/images/<dossier>/<fichier>.jpg`. Les dimensions sont lues dans le nom du fichier s'il se termine par `-1024x683` ; sinon, ajouter `image_width` et `image_height`. Sans `image`, la page utilise l'image du site. La valeur peut aussi être un lien Obsidian, **entre guillemets** :
  `image: "[[assets/images/<dossier>/<fichier>.jpg]]"`. Sans les guillemets, la valeur n'est pas lue correctement
- **Lien canonique** (`<link rel="canonical">`) : généré automatiquement pour chaque page
- `og:title` renvoie `Aurélien Krieger` sur toutes les pages.

## 6. Polices

Les polices utilisées sont `Inter-Regular.ttf`, `Inter-Light.ttf` et `Inter-ExtraLight.ttf`, dans `content/assets/font/`. 

## 7. Page d'erreur 404

Elle est gérée par le code (`quartz/components/pages/404.tsx`). Pour changer son texte, c'est le seul fichier à modifier.

---

## 8. À éviter

- Ne pas mettre de HTML dans le contenu, sauf `<br>` dans une cellule de tableau
- Ne mettre qu'un seul `#` par fichier, tout en haut
- Ne pas utiliser `#` pour des sections, commencer par `##`. Ne pas sauter de niveau de titre (pas de `###` sans `##` avant)
- Ne pas oublier la ligne d'en-tête d'un tableau
- Toujours laisser une ligne vide entre les une image et sa légende 
- Les champs `featured`, `home_order`, `summary` et `cover` des fichiers projet ne sont pas utilisés. Ils peuvent être supprimés. Pour qu'une image serve à l'aperçu sur les réseaux sociaux, renommer `cover` en `image`.

## 9. Liste de vérification avant de publier

- [ ] L'en-tête (`---`) contient `type` et `title`.
- [ ] Il y a un seul `#`, tout en haut.
- [ ] Les liens externes commencent par `https://`.
- [ ] Les chemins d'images correspondent à des fichiers existants dans `content/assets/images/`.
- [ ] Les légendes sont en italique, séparées de l'image par une ligne vide.
- [ ] La page a été relue en aperçu local, sur grand écran et en largeur mobile.

## 10. Faire durer le site et reconstruire l'environnement

### Ce que fait chaque fichier ou dossier

- **`package.json`** : liste les dépendances dont le projet a besoin
- **`package-lock.json`** : fige les versions exactes de toutes les dépendances. C'est la « recette » pour reconstruire l'environnement à l'identique
- **`node_modules/`** : les dépendances installées. C'est ce dossier que Quartz utilise réellement quand le build est lancé. Il **n'est pas portable d'un environnement à un autre**. On le génère sur place, plutôt que de le copier.
- **`.nvmrc`** est un fichier texte qui contient la version de Node utilisée au moment de construire le projet. Il sert de référence pour plus tard.
- **`.htaccess`** est le fichier de configuration utilisé par les serveurs web **Apache**. Il définit notamment comment interpréter les liens internes tels que `work/ors` pour ouvrir le fichier correspondant `work/ors.html`

### Règles à retenir

- **`npm`** sert à installer les dépendances. Un npm plus récent lit sans problème un lockfile créé par un npm plus ancien (sauf un npm très ancien, avant la version 7).
- **La version de Node est le vrai point sensible.** Une version trop récente ou trop ancienne peut faire échouer certains modules.

### Lignes de commande

**`npm install`** peut mettre à jour des versions et réécrire le lockfile : à réserver pour l'ajout ou à la mise à jour d'un paquet. Il compare `package.json` et `package-lock.json` s’il existe :
- Si le lockfile existe et correspond à `package.json`, il installe les versions du lockfile, et ignore les plus récentes sans rien mettre à jour dans le lockfile
- Il ne cherche de nouvelles versions que si `package.json` a changé (dépendance ajoutée ou plage modifiée) ou s’il n’y a pas de lockfile. Dans ce cas, il réécrit `package-lock.json`.
- Il garde l’éventuel `node_modules` et le complète.

**`npm ci`** permet de faire un "clean install". Il permet de reconstruire le site sur une nouvelle machine uniquement d’après `package-lock.json` :
- Il supprime d’abord `node_modules`, puis le recrée en installant exactement les versions du `package-lock.json`
- Il ne modifie jamais `package.json` ni `package-lock.json`.
- Si `package.json` et `package-lock.json` ne correspondent pas ou que le lockfile est absent, il s'arrête avec une erreur.
