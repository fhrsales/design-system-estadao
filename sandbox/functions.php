<?

require __DIR__ . '/vendor/autoload.php';

use Hashids\Hashids;

$salt = 'Lasier Martins';
$minHashLength = 12;
$alphabet = 'abcdefghijklmnopqrstuvwxyz1234567890';

$hashids = new Hashids($salt, $minHashLength, $alphabet);

$templates = [
  'padrao' => 'Padrão',
  'quiz' => 'Quiz',
  'stories' => 'Stories',
];

function get_mime_type($filepath) {
  $type = explode('/', mime_content_type($filepath))[0];

  switch ($type) {
    case 'audio':
    case 'image':
    case 'video':
      return $type;

      break;
    default:
      return '';

      break;
  }
}

function get_fa_type($filepath) {
  $type = explode('/', mime_content_type($filepath))[0];

  switch ($type) {
    case 'audio':
    case 'image':
    case 'video':
      return "-{$type}";

      break;
    case 'text':
      return '-alt';

      break;
    default:
      return '';

      break;
  }
}

function get_root_uri() {
  return 'http' . (array_key_exists('HTTPS', $_SERVER) ? 's' : '') . '://' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['SCRIPT_NAME']);
}

function chunk_id($id) {
  return implode('/', explode(' ', trim(chunk_split($id, 2, ' '))));
}

function uuidv4() {
  $data = random_bytes(16);

  $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // set version to 0100
  $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // set bits 6-7 to 10

  return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

function format_authors($authors) {
  $authors_formatted = '';

  foreach ($authors as $index => $author) {
    if ($author->type === 'função' && trim($author->value) !== '') {
      $authors_formatted .= "{$author->value}: ";
    } else {
      $authors_formatted .= $author->value;

      if ($index < count($authors) - 1) $authors_formatted .= ' / ';
    }
  }

  return $authors_formatted;
}

function get_date($filename) {
  return strtolower(strftime ('%d de %B de %Y | %Hh%M', filemtime($filename)));
}

function tr_size($block_size) {
  switch (strtoupper($block_size)) {
    case 'P':
      return 's';

      break;
    case 'M':
      return 'm';

      break;
    case 'G':
      return 'l';

      break;
    case 'GG':
      return 'xl';

      break;
    default:
      return 's';

      break;
  }
}

function tr_type($block_type) {
  switch ($block_type) {
    case 'colunas':
      return 'split';

      break;
    case 'imagem':
      return 'image';

      break;
    case 'chapéu':
      return 'kicker';

      break;
    case 'citação':
      return 'quotes';

      break;
    case 'gráfico':
      return 'graphic';

      break;
    case 'html':
      return 'html';

      break;
    case 'linha_fina':
      return 'lead';

      break;
    case 'separador':
      return 'divider';

      break;
    case 'text':
      return 'paragraph';

      break;
    case 'título':
      return 'heading';

      break;
    case 'título_principal':
      return 'headline';

      break;
    case 'vídeo':
      return 'video';

      break;
    // default:
    //   return 'paragraph';
    //
    //   break;
  }
}

function tr_bool($value) {
  if (strtolower($value) === 'sim') {
    return json_encode(TRUE);
  } else if (strtolower($value) === 'não') {
    return json_encode(FALSE);
  }
}


function render( $block, $id ) {
  // print_r($block);

  // global $app;

  $root = 'https://arte.estadao.com.br';

  echo
  '<div ' .
    'id="'                . ( isset( $block->anchor ) ? $block->anchor : '' ) . '" ' .
    'class="arte-column-' . ( isset( $block->value->tamanho ) ? tr_size($block->value->tamanho) : 's' )   . '" ' .
    'data-contains="'     . tr_type($block->type)                                      . '" ' .
    'data-align="'        . ( isset( $block->align ) ? $block->align : '' )   . '">';

  if ( property_exists( $block, 'content' ) && is_array( $block->content ) && $block->type !== 'split' ) {

    foreach ( $block->content as $inner_block ) {

      render( $inner_block );

    }

  } else {

    switch ( tr_type($block->type) ) {


      case 'navigation':

        if ( $block->mode == 'all' ) {

          echo
          '<nav ' .
            'class="' . $block->class . '" ' .
            'style="' . $block->style . '" ' .
            'data-mode="' . $block->mode . '">' .
            '<div>' .
              '<ul>';

              foreach ( $block->chapters as $chapter ) {

                if ( property_exists( $chapter, 'clickable' ) && $chapter->clickable === true ) {
                  $class = '';
                } else {
                  $class = 'arte-chapter-disabled';
                }

                echo
                '<li class="' . $class . '">' .
                  '<a href=" ' . $chapter->url . '">' .
                    '<div>' .
                      '<div>' . $chapter->number . '</div>' .
                      '<div>' . $chapter->title . '</div>' .
                    '</div>' .
                    '<img src="' . ( $chapter->media ? $chapter->media : get_open_graph( $chapter->url ) ) . '">' .
                  '</a>' .
                '</li>';

              }

              echo
              '</ul>' .
            '</div>' .
          '</nav>';

        }

        if ( $block->mode == 'next' ) {

          echo
          '<nav ' .
            'class="' . $block->class . '" ' .
            'style="' . $block->style . '" ' .
            'data-mode="' . $block->mode . '">' .
            '<div>' .
              '<ul>';

              foreach ( $block->chapters as $chapter ) {

                echo
                '<li>' .
                  '<a href=" ' . $chapter->url . '">' .
                    '<div>' .
                      '<div>' . $chapter->number . '</div>' .
                      '<div>' . $chapter->title . '</div>' .
                    '</div>' .
                    '<img src="' . ( $chapter->media ? $chapter->media : get_open_graph( $chapter->url ) ) . '">' .
                    '<div>Próximo capítulo →</div>' .
                  '</a>' .
                '</li>';

              }

              echo
              '</ul>' .
            '</div>' .
          '</nav>';

        }

        break;

      case 'kicker':
        echo '<h4>' . $block->value . '</h4>';

        break;

      case 'heading':
        echo '<h3>' . $block->value . '</h3>';

        break;

      case 'headline':
        echo '<h1>' . $block->value . '</h1>';

        break;

      case 'paragraph':
      case 'annotation':
      case 'indentation':
      case 'box':

        echo '<p>' . $block->value . '</p>';

        break;

      case 'lead':
        echo '<p class="arte-lead">' . $block->value . '</p>';

        break;

      case 'quotes':

        // echo
        // '<blockquote ' .
        //   'class="' . $block->class . '" ' .
        //   'style="' . $block->style . '">' .
        //
        //   '<div>' . $block->content . '</div>' .
        //   '<div>' . $block->author . '</div>' .
        //
        // '</blockquote>';

        foreach ($block->value as $child) {
          if ($child->type === 'text') $content = $child->value;
          if ($child->type === 'autor') $author = $child->value;
        }

        echo <<<QUOTES
          <blockquote class="arte-blockquote">
            <div class="arte-blockquote__quote">{$content}</div>

            <div class="arte-blockquote__author">{$author}</div>
          </blockquote>
QUOTES;


        break;

      case 'divider':

        echo '<hr>';

        break;

      case 'image':

        // if ( $block->provider == 'local' ) {
        //
        //   $path = '';
        //
        //   if ( !localhost() ) {
        //
        //     if ( $app->category === '' )
        //       $path .= $root . '/' . $app->section . '/' . $app->slug . '/';
        //
        //     else
        //       $path = $root . '/' . $app->section . '/' . $app->category . '/' . $app->slug . '/';
        //
        //   }
        //
        //   $path .= 'media/images/';
        //
        //   echo
        //   '<div ' .
        //     'class="arte-media ' . $block->class . '" ' .
        //     'style="' . $block->style . '">' .
        //
        //     '<figure>' .
        //       '<img src="' . $path . $block->id . '">' .
        //       '<figcaption>' .
        //         '<span class="arte-image-caption">' . $block->options->caption . '</span>' .
        //         '<span class="arte-image-credit">' . $block->options->credit . '</span>' .
        //       '</figcaption>' .
        //     '</figure>' .
        //
        //   '</div>';


        $relative_path = chunk_id($id);
        $src = "http://arte.local/public/pages/{$relative_path}/{$block->value->fonte}";

          echo
          '<div class="arte-media">' .
            '<figure>' .
              '<img src="' . $src . '">' .
              '<figcaption>' .
                '<span class="arte-image-caption">' . $block->value->legenda . '</span>' .
                '<span class="arte-image-credit">' . $block->value->crédito . '</span>' .
              '</figcaption>' .
            '</figure>' .

          '</div>';

        break;

      case 'video':
        // print_r($block);

        if (strtolower($block->value->origem) === 'youtube') {
            $params = array(
              'color'       => 'white',
              'playsinline' => '1',
              'rel'         => '0',
            );

            $query = http_build_query($params);

            $src  = 'https://www.youtube.com/embed/';
            $src .= $block->value->fonte;
            $src .= '?';
            $src .= $query;

            $caption = isset($block->value->legenda) ? $block->value->legenda : '';
            $credit = isset($block->value->crédito) ? $block->value->crédito : '';

            echo <<<VIDEO
              <div class="arte-media arte-image-local">
                <figure>

                  <div class="youtube-container">
                    <iframe src="{$src}" allowfullscreen></iframe>
                  </div>

                  <figcaption>
                    <span class="arte-image-caption">{$caption}</span>
                    <span class="arte-image-credit">{$credit}</span>
                  </figcaption>

                </figure>

              </div>
VIDEO;

        }

        break;

      case 'gallery':

        if ( $block->provider == 'agile' ) {

          echo
          '<div ' .
            'class="' . $block->class . ' mm_conteudo blog-multimidia galeria" ' .
            'style="' . $block->style . '" ' .
            'data-config=\'{"tipo":"GALERIA","id":"' . $block->id . '","provider":"AGILE"}\'></div>';

        }

        break;

      case 'graphic':

        // if ( $block->provider == 'uva' ) {
        //
        //   echo
        //   '<script ' .
        //     'data-uva-id="'           . $block->id                                  . '" ' .
        //     'data-show-title="'       . json_encode( $block->options->title )       . '" ' .
        //     'data-show-description="' . json_encode( $block->options->description ) . '" ' .
        //     'data-show-brand="'       . json_encode( $block->options->brand )       . '" ' .
        //     'src="https://arte.estadao.com.br/uva/scripts/embed.min.js" '           .
        //     '></script>';
        //
        // }

        echo
        '<script ' .
          'data-uva-id="'           . $block->value->fonte                       . '" ' .
          'data-show-title="'       . tr_bool( $block->value->mostrar_título )       . '" ' .
          'data-show-description="' . tr_bool( $block->value->mostrar_descrição ) . '" ' .
          'data-show-brand="'       . tr_bool( $block->value->mostrar_marca )       . '" ' .
          'src="https://arte.estadao.com.br/uva/scripts/embed.min.js" '           .
          '></script>';

        break;

      case 'link':

        echo
        '<a ' .
          'class="' . $block->class . '" ' .
          'style="' . $block->style . '" ' .
          'href="'  . $block->href  . '" ' .
          'target="_blank">' .

          $block->content .

        '</a>';

        break;

      case 'credits':

        echo
        '<p><dl ' .
          'class="' . $block->class . '" ' .
          'style="' . $block->style . '">';

          foreach ( $block->roles as $entry ) {

            echo
            '<dt>' . $entry->role . '</dt>' .
            '<dd>' . $entry->people . '</dd>';

          }

        echo '</dl></p>';

        break;

      case 'html':

      $content = '';

      foreach ($block->value as $child) {
        if ($child->type === 'text') $content .= $child->value;
      }

      echo $content;

        // echo
        // '<div ' .
        //   'class="' . $block->class . '" ' .
        //   'style="' . $block->style . '">' .
        //
        //   $block->content .
        //
        // '</div>';

        break;

      case 'split':

        // echo
        // '<div ' .
        //   'class="' . $block->class . ' arte-split" ' .
        //   'style="' . $block->style . '" ' .
        //   'data-fraction="' . $block->options->fraction . '" ' .
        //   'data-blocks="' . count( $block->content ) .'" >';
        //
        //   foreach ( $block->content as $content ) {
        //     render( $content );
        //   }
        //
        // echo '</div>';

        echo
        '<div class="arte-split" ' .
          // 'data-fraction="' . $block->options->fraction . '" ' .
          'data-fraction="even" ' .
          'data-blocks="2" >';

        echo '<div class="arte-split__column">';

          // print_r($block->value->esquerda);

          foreach ( $block->value->esquerda as $content ) {
            render($content, $id);
          }

        echo '</div>';

        echo '<div class="arte-split__column">';

          // print_r($block->value->esquerda);

          foreach ( $block->value->direita as $content ) {
            render($content, $id);
          }

        echo '</div>';

        echo '</div>';

        break;

      case 'include':

        $string = file_get_contents( 'include/' . $block->content . '.php' );
        $string = str_replace( array( "\r", "\n" ), '', $string );
        $string = trim( $string );

        echo $string;

        break;

      // default:
      //   echo '<p>' . $block->value . '</p>';

    }

  }

  echo "</div>\n";

}