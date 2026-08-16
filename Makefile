.PHONY: build frontend docker run run-local clean rebuild

# Build Docker image
build:
	docker build -t algotraceviewer .

# Run using the local presets
run:
	docker run --rm --name algotraceviewer -p 8080:8080 -v ./backend/data:/app/data algotraceviewer

clean:
	docker image rm algotraceviewer 2>/dev/null || true

rebuild: clean build