# Containers
This directory should contain docker files and their required resources. In most cases a single docker file is enough but when resources need to be included in the repo a corresponding directory for the context should be created.

## Example
```yml
frontend.Dockerfile
backend:
  backend.Dockerfile
  backend-resource.file
```