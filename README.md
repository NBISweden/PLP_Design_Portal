# PLP\_Design\_Portal

This repository contains a package designed for the creation of padlock probes that directly target RNA molecules. Padlock probes are highly specific molecular tools used in various applications, including RNA detection, spatial transcriptomics, and single-cell RNA sequencing. This package facilitates the design of these probes by targeting specific RNA sequences, enabling precise hybridization for downstream applications.

In addition to probe design, this repository also serves as a platform for the development of a portal aimed at simplifying and enhancing the workflow for researchers. The portal will provide a user-friendly interface to streamline the design process.

## Getting Started

The simplest way to get started with this project is by using the provided `docker compose` setup. It describes how to configure the system and makes it easy to run.

The current `docker compose` setup supports two cases: `dev` and `prod`, where `dev` is configured to ease development, and `prod` is configured to mimic what will be deployed in production.

Make sure to install `docker` and `docker compose` before continuing.

### Running the Code

The project contains a utility script with some commonly used, simplified commands for development. The script is called `manage` and is a shell script located in the root of the project. Examples of how to use the `manage` script follow:

```sh
# Running ./manage will print a friendly help message
./manage
```

The `./manage dev` and `./manage prod` commands are shorthands for using the `dev` and `prod` profiles, respectively, and thus accept all the options that `docker compose` would accept.

```sh
# Running ./manage dev ... will start the development environment
# making the application available at http://localhost:5000
./manage dev up
```

```sh
# Running ./manage prod ... will start the production environment
# making the application available at http://localhost:5000
./manage prod up
```

### Adding Data

When starting the project from scratch, you might notice that you have no way of selecting which `genome` you want to work with. This is because the system needs to be populated with data.

The necessary data to make genomes available in the system follows a hierarchy described as follows:

* test-data

  * genome\_data

    * `<genome_name>.fa`
    * `<genome_name>.fa.fai`
    * `<genome_name>.gtf`
  * genome\_list.json

The `test-data` directory should be placed in the root of the project. The `genome_data` directory should contain the genome files, and the `genome_list.json` file should contain a list of genomes to be made available in the application. An example of `genome_list.json` follows:

```json
[
    {
        "id": "mus",
        "version": "0.0.1",
        "fa_path": "genome_data/Mus.fa",
        "gtf_path": "genome_data/tmp.gtf"
    }
]
```

The items in the list will appear in the order they are included. The parameters of each entry can be described as follows:

* `id`: A unique string identifier within the list
* `version`: Indicates the genome version (should follow the format x.y.z)
* `fa_path`: Path from the location of `genome_list.json` to the corresponding `.fa` file (the path to the `.fa.fai` file is inferred from `fa_path`)
* `gtf_path`: Path to the `.gtf` file to be used with the genome

## Getting Around

The main parts of this system are located in the `system` folder, and the primary user-facing components are `frontend` and `backend`.

* `frontend`: Uses, among other things, `npm`, `Vite`, `TypeScript`, and `React` to build a set of static HTML, JavaScript, and CSS files to be served by the backend.
* `backend`: Based on `Python` and `Flask`, it provides a simple REST API that the frontend can use to issue calculation jobs.

The main entry point for the `frontend` is `system/frontend/src/main`, and the main entry point for the `backend` is `system/backend/app.py:create_app()`.
