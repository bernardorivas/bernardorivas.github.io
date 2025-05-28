---
# Leave the homepage title empty to use the site title
title: ""
date: 2022-10-24
type: landing

design:
  spacing: "6rem"

sections:
  - block: resume-biography-3
    content:
      username: admin
      text: ""
      button:
        text: Download CV
        url: uploads/resume.pdf
    design:
      css_class: dark
      background:
        color: black
        image:
          filename: radiant-gradient.svg
          filters:
            brightness: 1.0
          size: cover
          position: center
          parallax: false
  - block: collection
    id: papers
    content:
      title: Recent Publications
      text: ""
      filters:
        folders:
          - publication
        exclude_featured: false
    design:
      view: citation
  - block: collection
    id: projects
    content:
      title: Recent Projects
      filters:
        folders:
          - project
      view_all:
        url: 'project/'
        text: 'See all projects'
    design:
      view: article-grid
      columns: 3
  - block: collection
    id: talks
    content:
      title: Recent Talks
      filters:
        folders:
          - talks
    design:
      view: article-grid
      columns: 1
  - block: collection
    id: teaching
    content:
      title: Recent Teaching
      filters:
        folders:
          - teaching
    design:
      view: article-grid
      columns: 2
---
