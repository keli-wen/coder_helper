cd ../
echo $(pwd)
echo "Start linting..."
echo ""

# Define the lint config.
html_lint_config="./lint/.htmlhintrc"
js_lint_config="./lint/.eslintrc.js"

# Linting HTML
echo -e "\033[33mLinting HTML... \033[0m"

htmlhint --config $html_lint_config index.html
htmlhint --config $html_lint_config html/*.html

# Linting JS
echo -e "\033[33mLinting JS... \033[0m"
eslint --config $js_lint_config main.js
eslint --config $js_lint_config js/*.js

# 绿色字体
echo -e "\033[32m Linting finished! \033[0m"